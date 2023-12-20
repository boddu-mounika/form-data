import logo from "./logo.svg";
import "@aws-amplify/ui-react/styles.css";

import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import LandingPage from "./LandingPage";
// import Sample from "./SamplePages/SimpleStartPage";
// import Sidebar from "./ChatGptPoc/Sidebar";
import Submit from "./Submit"

const myAPI = "formapi";
const path = "/customer";

function App() {
  // //const location = useLocation();
  // //console.log(location);
  // const [input, setInput] = useState("");
  // const [customers, setCustomers] = useState([]);
  return (
    <div>    
      <Routes>    
      <Route path="/" element={<LandingPage />} />    
        <Route exact path="/Submit/:key" element={<Submit />}/>
      </Routes>
    </div>
  );
}


export default App;

// function getCustomer(e) {
//   let customerId = e.input;
//   alert("test-1");
//   API.get(myAPI, path + "/" + customerId)
//     .then((response) => {
//       console.log(response);
//       let newCustomers = [...customers];
//       newCustomers.push(response);
//       setCustomers(newCustomers);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }

// <View className="App">
//     <div className="App">
//       <h1>Super Simple React App</h1>
//       <div>
//         <input
//           placeholder="customer id"
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />
//       </div>
//       <br />
//       {/* <button onClick={() => getCustomer({ input })}>
//         Get Customer data from Backend
//       </button> */}

//       <h2 style={{ visibility: customers.length > 0 ? "visible" : "hidden" }}>
//         Response
//       </h2>
//       {customers.map((thisCustomer, index) => {
//         return (
//           <div key={thisCustomer.customerId}>
//             <span>
//               <b>CustomerId:</b> {thisCustomer.customerId} -{" "}
//               <b>CustomerName</b>: {thisCustomer.customerName}
//             </span>
//           </div>
//         );
//       })}
//     </div>
//     {/* <Sample /> */}
//     <Button onClick={signOut}>Sign Out</Button>
//   </View>
