import React from "react";
import TextField from "@mui/material/TextField";

const ShowQuestions = (props) => {
  return (
    <div>
      {props.data.map((question, index) => (
        <div key={index}>
          <h3>{question.OriginalQuestion}</h3>
          {/* <p>{question.StandardAnswerWeb}</p> */}
          <TextField
            id={question.OriginalQuestion}
            name={question.Id.toString()}
            label="Your response"
            sx={{ m: 1, width: "120ch" }}
            placeholder="Placeholder"
            multiline
            rows={4}
            onChange={props.handleValueChange}
            value = {question.StandardAnswerWeb?question.StandardAnswerWeb:""}
          />
        </div>
      ))}
    </div>
  );
};

export default ShowQuestions;
