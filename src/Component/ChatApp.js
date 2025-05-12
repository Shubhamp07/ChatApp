import axios from "axios";
import React, { useState, useEffect } from "react";
import { RotateLoader } from "react-spinners";

const ChatApp = () => {
  const [inputData, setInputData] = useState("");
  const [qus, setQus] = useState("");
  const [ans, setAns] = useState("Hello, How Can I Help You!");
  const [loading, setLoading] = useState(false);
  const [qusClass, setQusClass] = useState("show-qus");
  const [history, setHistory] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [showHistory, setShowHistory] = useState(false); // State for toggling history visibility

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

  const API_KEY = "AIzaSyDDfxfUao0xZ72Of9HL2N4Wsdcrlx5j4wg"; 

  const sendingData = {
    contents: [
      {
        parts: [{ text: "" }],
      },
    ],
  };

  // Function to dynamically update greeting based on time
  const updateGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning!");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon!");
    } else {
      setGreeting("Good Evening!");
    }
  };

  useEffect(() => {
    updateGreeting();
  }, []); // Updates greeting when component mounts

  const getData = () => {
    setQusClass("hide-qus");
    setLoading(true);
    setAns("");
    setQus("");

    axios
      .post(`${url}+${API_KEY}`, sendingData)
      .then((res) => {
        const output = res.data.candidates[0].content.parts[0].text;

        // Filter and process the output into points
        const sentences = output.split("**");
        const filteredOutput = sentences.slice(0, 30); // Get the first 30 points for brevity

        // Format output into point-wise structure with bold for important phrases
        const formattedOutput = filteredOutput.map((sentence, index) => {
          if (index === 0) {
            return `<strong>${sentence.trim()}.</strong>`; // Highlight the first point
          }
          return `• ${sentence.trim()}.`; // Render the remaining points as list items
        }).join("<br />"); // Join them with line breaks for display

        setAns(formattedOutput); // Store formatted output
        setQus(sendingData.contents[0].parts[0].text);

        // Add question and formatted answer to history
        setHistory((prevHistory) => [
          ...prevHistory,
          { question: sendingData.contents[0].parts[0].text, answer: formattedOutput },
        ]);

        setLoading(false);
        setInputData(null)
        
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setQusClass("show-qus");
      });
  };

  const handleInput = (e) => {
    const inputvalue = e.target.value;
    sendingData.contents[0].parts[0].text = inputvalue;
   
  };

  const toggleHistory = () => {
    setShowHistory((prevShowHistory) => !prevShowHistory); // Toggle the visibility
  };

  return (
    <>
      <div className="container">
        {/* Greeting */}
        <h2>{greeting}</h2>

        <div className="data-container">
          <p className={qusClass}>{qus}</p>
          <p className="ans" dangerouslySetInnerHTML={{ __html: ans }}></p>
          <div className="loader">
            <RotateLoader loading={loading} />
          </div>
        </div>

        {/* Input Section */}
        <div className="input-container">
          <input type="text" placeholder="Ask Anything" onChange={handleInput} />
          <button className="btn btn-primary mt-5 mx-4" onClick={getData}>
            Submit
          </button>
        </div>

        {/* History Toggle Button */}
        <div className="history-toggle">
          <button className="btn btn-secondary mt-3" onClick={toggleHistory}>
            {showHistory ? "Hide History" : "Show History"}
          </button>
        </div>

        {/* History Section */}
        {showHistory && ( // Render history only if showHistory is true
          <div className="history">
            <h3>History</h3>
            <ul>
              {history.map((item, index) => (
                <li key={index}>
                  <strong>Q:</strong> {item.question} <br />
                  <strong>A:</strong> <span dangerouslySetInnerHTML={{ __html: item.answer }}></span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatApp;
