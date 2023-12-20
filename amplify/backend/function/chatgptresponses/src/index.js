/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const axios = require("axios");
const aws = require("aws-sdk");

exports.handler = async (event) => {
  //const isQuestion = true;
  console.log(event.pathParameters.id);
  const caseId = event.pathParameters.id;
  let questions=[];
  const { Parameters } = await new aws.SSM()
    .getParameters({
      Names: ["DB_USERNAME", "DB_PASS", "key"].map(
        (secretName) => process.env[secretName]
      ),
      WithDecryption: true,
    })
    .promise();

  //console.log(DbParameters);

  let promise = new Promise((resolve, reject) => {
    let sql = require("mssql");

    const config = {
      user: Parameters[1].Value,
      password: Parameters[0].Value,
      server: "pocdb.cbjhfsw0n963.us-east-2.rds.amazonaws.com",
      port: 1433,
      options: {
        database: "StevePoc",
        encrypt: false,
      },
    };

    sql.connect(config, (err) => {
      if (err) {
        reject(err);
      } else {
        const request = new sql.Request();
        request.input("caseId", sql.NVarChar, caseId);

        const selectQuery = `select q.Id, q.SequenceNumber,q.MsgSentDateTime,  q.CaseId, q.MsgSent, q.MsgReceived, q.OriginalQuestion ,q.StandardQuestion,q.StandardAnswer as StandardAnswerWeb,  r.StandardAnswer, r.OriginalAnswer from questions q 
        left outer join responses r on q.Id = r.QuestionId
        where q.CaseId=@caseId order by q.SequenceNumber asc`;
        request.query(selectQuery, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }
    });
  });

  // const { Parameters } = await new aws.SSM()
  //   .getParameters({
  //     Names: ["key"].map((secretName) => process.env[secretName]),
  //     WithDecryption: true,
  //   })
  //   .promise();

  console.log(`EVENT: ${JSON.stringify(event)}`);
  let resp = "";
  let prompt = "Who is presiden of India";
  //console.log(prompt);
  try {
    questions = await promise;
    let filteredQuestions = questions.recordset.filter((row) => row.StandardAnswerWeb !== null);
    //console.log(result.recordset);
    await Promise.all(
      filteredQuestions.map(async (element) => {
        console.log(element.OriginalQuestion)
        const chatgptPrompt =process.env.CHATGPT_PROMPT_ANSWER+":"+ element.StandardAnswerWeb;
          // (isQuestion
          //   ? process.env.CHATGPT_PROMPT
          //   : process.env.CHATGPT_PROMPT_ANSWER) +":"+ element.OriginalQuestion;
        const res = await axios.post(
          `https://api.openai.com/v1/chat/completions`,
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: chatgptPrompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + Parameters[2].Value,
            },
          }
        );
        console.log(res);
        element.OriginalAnswer = res.data.choices[0].message.content;
        console.log(element.OriginalAnswer);
      })
    );


    //console.log(result);
    //console.log(resp.data.choices[0].message.content);

    //return resp.data.choices[0].text;
    // return {
    //   statusCode: 200,
    //   //Uncomment below to enable CORS requests
    //   headers: {
    //     "Access-Control-Allow-Origin": "*",
    //     "Access-Control-Allow-Headers": "*",
    //   },
    //   body: JSON.stringify(result),
    // };
  } catch (error) {
    console.error("Error making chatgpt call", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: error.message,
    };
  }

  promise = new Promise((resolve, reject) => {
    let sql = require("mssql");

    const config = {
      user: Parameters[1].Value,
      password: Parameters[0].Value,
      server: "pocdb.cbjhfsw0n963.us-east-2.rds.amazonaws.com",
      port: 1433,
      options: {
        database: "StevePoc",
        encrypt: false,
      },
    };

    sql.connect(config).then((pool) => {
      const request = new sql.Request();

      // Define the table and column names
      const tableName = "questions";
      const idColumnName = "Id";
      const nameColumnName = "OriginalAnswer";
      let tabledata = questions.recordset;
      //const request = new sql.Request();

      // Generate bulk update query
      let query = `UPDATE ${tableName} SET ${nameColumnName} = CASE `;
      let params = [];
      console.log(tabledata.filter((row) => row.OriginalAnswer !== null));
      const filteredTableData = tabledata.filter(
        (row) => row.OriginalAnswer !== null
      );

      filteredTableData.forEach((row) => {
        console.log(row.StandardQuestion);
        query += `WHEN ${idColumnName} = @id${row.Id} THEN @name${row.Id} `;
        request.input(`id${row.Id}`, sql.Int, row.Id);
        request.input(`name${row.Id}`, sql.NVarChar, row.OriginalAnswer);
      });
      query += `END WHERE ${idColumnName} IN (`;
      query += filteredTableData.map((row) => `@id${row.Id}`)
        .join(",");
      query += ")";

      console.log(query);

      // Execute the bulk update query
      const result = request.query(query);

      //console.log(`Rows affected: ${result.rowsAffected}`);
      resolve(result);
    });
  });

  try {
    const result = await promise;
    console.log("Step-1");
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(result),
    };
    return response;
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(e),
    };
  }
};
