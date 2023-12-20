import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "aws-amplify";
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Box,
  Slide,
} from "@mui/material";
import ShowQuestions from "./ShowQuestions";
import Loading from "./ReusableComponents/Loading";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Submit = (props) => {
  const { key } = useParams();
  console.log(key);

  const myAPI = "formapi";

  let initialState = {
    showDialog: false,
    phoneNumber: "",
    casePhonenumber: "",
    phoneNumberVerified: true,
    tableData: [],
    isLoading: true,
    changesMade: false,
    showThankyouMessage: false,
  };
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const path = "/phonenumbercheck";
    const caseId = key.split("-")[0];
    let record;
    //setState({ ...state, isLoading: true });
    async function getPhonenumber() {
      await API.get(myAPI, path + "/" + caseId, {
        headers: {
          "Content-Type": "text/plain",
        },
      }).then(async (response) => {
        console.log(response);
        record = await response.recordset[0];
        console.log(record);
        console.log(record.PhoneNumber);
        //console.log(tableData);
        setState({
          ...state,
          casePhonenumber: record.PhoneNumber,
          isLoading: false,
          showDialog: true,
        });
      });
    }

    getPhonenumber();
  }, []);

  const handleChange = (e) => {
    let newState = { ...state };
    newState[e.target.name] = e.target.value;
    setState(newState);
  };

  const checkPhoneNumber = async () => {
    const path = "/getQuestionsform";
    console.log(state.casePhonenumber + "..." + state.phoneNumber);
    if (state.casePhonenumber.toString() !== state.phoneNumber.toString()) {
      setState({ ...state, phoneNumberVerified: false });
    } else {
      let tableData;
      setState({ ...state, isLoading: true });
      await API.get(myAPI, path + "/" + key.split("-")[0], {
        headers: {
          "Content-Type": "text/plain",
        },
      }).then(async (response) => {
        console.log(response);
        tableData = await response.recordset;
        console.log(tableData);
        //await updateChatGptQuestions(tableData);
      });
      setState({
        ...state,
        tableData: tableData,
        showDialog: false,
        phoneNumberVerified: true,
        isLoading: false,
      });
    }
  };

  const updateChatGptQuestions = async (tableData) => {
    const path = "/Chatgptcall";
    tableData.forEach(async (element) => {
      console.log(element.OriginalQuestion);
      //await new Promise((resolve) => setTimeout(resolve, index * 1000));
      const response = await API.get(
        myAPI,
        path + "/" + element.OriginalQuestion
      );
      console.log(response.recordset[0]);
      element.StandardQuestion = response.recordset[0];
    });
    setState({
      ...state,
      tableData: tableData,
      showDialog: false,
      phoneNumberVerified: true,
      isLoading: false,
    });
  };

  const handleValueChange = (e) => {
    const updatedQuestions = state.tableData.map((question) => {
      if (question.Id.toString() === e.target.name.toString()) {
        return { ...question, StandardAnswerWeb: e.target.value };
      }
      return question;
    });
    setState({ ...state, tableData: updatedQuestions, changesMade: true });
  };

  const onSubmit = async () => {
    setState({ ...state, isLoading: true });
    const path = "/updateresponses";
    const path2 = "/chatgptresponses";
    const formData = new FormData();
    formData.append("data", JSON.stringify(state.tableData));
    await API.post(myAPI, path, {
      //   headers: {
      //     "content-type": "multipart/form-data",
      //   },
      body: formData,
    }).then(async (response) => {
      await response;
      API.get(myAPI, path2 + "/" + key.split("-")[0]);
    });
    setState({
      ...state,
      isLoading: false,
      changesMade: false,
      showThankyouMessage: true,
    });
  };

  const handleClose = () => {
    setState({
      ...state,
      showDialog: false,
    });
  };

  return !state.isLoading ? (
    <React.Fragment>
      <h1>This is submit form</h1>
      <Dialog
        open={state.showDialog}
        TransitionComponent={Transition}
        //onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{"Confirm!"}</DialogTitle>

        <DialogContent>
          {!state.phoneNumberVerified && (
            <React.Fragment>
              <DialogContentText id="alert-dialog-slide-description">
                Sorry, validation against the phone number entered failed.
                Please try again!!!!
              </DialogContentText>
            </React.Fragment>
          )}

          <React.Fragment>
            <TextField
              id="phoneNumber"
              name="phoneNumber"
              label="Please enter your 10 digit phone number associated with the case for validation"
              variant="outlined"
              onChange={handleChange}
              value={state.phoneNumber}
              style={{ width: "80%", marginTop: "10px" }}
            />
            <Button
              variant="contained"
              onClick={checkPhoneNumber}
              disabled={state.phoneNumber.length !== 10}
              style={{ marginLeft: "10px", marginTop: "20px" }}
            >
              Check
            </Button>
          </React.Fragment>
        </DialogContent>
      </Dialog>

      {state.tableData != undefined &&
        state.tableData.length > 0 &&
        !state.showThankyouMessage(
          <React.Fragment>
            <h1>Here are your questions</h1>
            <ShowQuestions
              data={state.tableData}
              handleValueChange={handleValueChange}
            />
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={!state.changesMade}
            >
              Submit responses
            </Button>
          </React.Fragment>
        )}
      {showThankyouMessage && (
        <React.Fragment>
          <h1>Thank you for your responses!!!!</h1>
        </React.Fragment>
      )}
    </React.Fragment>
  ) : (
    <Loading />
  );
};

export default Submit;
