import React, { useState, useEffect } from "react";
import { Zap, LayoutDashboard, FileBarChart } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNfcSymbol } from "@fortawesome/free-brands-svg-icons";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { msalConfig, loginRequest } from "./authConfig";
 
// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// Login Component
function Login({ onLogin }: { onLogin: () => void }) {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((error) => {
      console.error("Login error:", error);
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      onLogin(); // Notify the parent component
    }
  }, [isAuthenticated, onLogin]);
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-12 transform transition-all duration-500 hover:scale-102">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faNfcSymbol} className="w-24 h-24 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Zap Vision
          </h2>
          <p className="text-gray-600">Access your secure dashboard</p>
        </div>

        <button
          onClick={handleLogin}
          className="mt-8 w-full group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 group-hover:skew-x-12 transition-transform duration-700 ease-out" />
          <FontAwesomeIcon icon={faNfcSymbol} className="w-6 h-6 text-white" />
          <span className="font-semibold">Continue with Microsoft</span>
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline decoration-2 decoration-blue-600/30">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline decoration-2 decoration-blue-600/30">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [reports, setReports] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAvailableReports, setShowAvailableReports] = useState(false);
  const [availableDates, setAvailableDates] = useState<{ date: string; reportName: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search bar
  const [errorPopup, setErrorPopup] = useState(false); // State for error popup
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  

  const togglePopup = () => setShowPopup(!showPopup);

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const isValidDate = (date: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
  };
  const fetchReports = async (date: string, name: string) => {
    setLoading(true);
    setError(null);
  
    try {
      if (!isValidDate(date)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD.");
      }
  
      const baseUrl = import.meta.env.VITE_API_BASE_URL; // Retrieve base URL from .env
      const normalizedName = name.toLowerCase().replace(/\s+/g, "-"); // Normalize name
      const url = `${baseUrl}/azure/download_files?date=${date}&name=${normalizedName}`;
  
      const response = await fetch(url);
  
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText); // Parse the error response
        const errorMessage = errorData.detail || "No files found for the specified filters.";
        throw new Error(errorMessage); // Throw the clean error message
      }
  
      const htmlContent = await response.text();
  
      // Check if the response contains any meaningful content
      if (htmlContent.trim() === "") {
        setError("No reports available for the selected date.");
        setErrorPopup(true); // Show error popup
        setReports(null); // Clear any previous reports
      } else {
        setReports(htmlContent); // Set the reports if content is available
      }
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError(err.message || "An unknown error occurred");
      setErrorPopup(true); // Show error popup
      setReports(null); // Clear any previous reports
    } finally {
      setLoading(false);
    }
  };
  const fetchAvailableDates = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL; // Retrieve base URL from .env
      const apiUrl = `${baseUrl}/azure/files`; // Updated endpoint
  
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Details:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
        });
        throw new Error(
          `Failed to fetch available files: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
  
      const data = await response.json(); // Parse the response as JSON
  
      // Check if the response has the expected structure
      if (!data || !data.files || !Array.isArray(data.files)) {
        throw new Error("Invalid API response structure: expected an object with 'files' array");
      }
  
      // Extract and format dates and report names from filenames
      const dateReportPairs = data.files
        .map((file) => {
          // Extract date using a regex for YYYYMMDD format
          const match = file.name.match(/(\d{4})(\d{2})(\d{2})/);
          if (!match) {
            console.warn(`No date found in file name: ${file.name}`);
            return null;
          }
  
          // Remove date, trailing numbers, and .html extension
          const cleanName = file.name
            .replace(/_\d{8}_\d+/, "") // Removes `_YYYYMMDD_XXXXXX`
            .replace(/\.html$/, ""); // Removes `.html` extension if present
  
          return {
            date: `${match[1]}-${match[2]}-${match[3]}`, // Format: YYYY-MM-DD
            reportName: cleanName, // Cleaned report name without numbers
          };
        })
        .filter((pair) => pair !== null) // Remove null values
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort dates in descending order
  
      setAvailableDates(dateReportPairs); // Set the sorted array in state
    } catch (err) {
      console.error("Error Details:", {
        message: err.message,
        stack: err.stack,
      });
      setError(err.message || "An unknown error occurred");
      setErrorPopup(true); // Show error popup
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    if (selectedDate && selectedOption) {
      fetchReports(selectedDate, selectedOption); // Fetch the report automatically
    }
  }, [selectedDate, selectedOption]);

  useEffect(() => {
    if (showAvailableReports) {
      fetchAvailableDates();
    }
  }, [showAvailableReports]);

  // Show Login Screen if not logged in
  if (!isLoggedIn) {
    return (
      <MsalProvider instance={msalInstance}>
        <Login onLogin={() => setIsLoggedIn(true)} />
      </MsalProvider>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg flex flex-col fixed h-full">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faNfcSymbol} className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Zap Vision</span>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <a
                href="#"
                onClick={() => setShowAvailableReports(false)} // Return to main page
                className="flex items-center space-x-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </a>
              <a
                href="#"
                onClick={() => {
                  setShowAvailableReports(true); // Show available reports
                  fetchAvailableDates(); // Fetch available dates
                }}
                className="flex items-center space-x-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <FileBarChart className="w-5 h-5" />
                <span className="font-medium">Available Reports</span>
              </a>
              <button
                onClick={togglePopup}
                className="flex items-center space-x-3 px-4 py-3 mt-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Zap className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {showAvailableReports ? (
  <div className="px-4 py-6 sm:px-0">
    {/* Available Dates */}
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Available Dates</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search with dates and Reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-blue-500">Loading available dates...</p>
      ) : availableDates.length > 0 ? (
        <>
          {/* Date List */}
          <div className="space-y-4">
          {availableDates
  .filter((pair) =>
    pair.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.reportName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .slice((currentPage - 1) * 5, currentPage * 5) // Show 5 dates per page
  .map((pair, index) => (
    <div
      key={index}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex flex-col">
        <span className="text-lg font-medium text-gray-700">{pair.date}</span>
        <span className="text-sm text-gray-500">{pair.reportName}</span>
      </div>
      <button
        onClick={() => {
          setSelectedDate(pair.date); // Set the selected date
          setSelectedOption(pair.reportName); // Set the repository name automatically
          setShowAvailableReports(false); // Go back to the main reports view
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Select
      </button>
    </div>
  ))}

          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} // Go to previous page
              disabled={currentPage === 1} // Disable if on the first page
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {Math.ceil(availableDates.length / 5)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(availableDates.length / 5))
                )
              } // Go to next page
              disabled={currentPage === Math.ceil(availableDates.length / 5)} // Disable if on the last page
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No available dates</p>
      )}
    </div>
  </div>
            ) : (
              <div className="px-4 py-6 sm:px-0">
                {/* Date Picker */}
                <div className="mb-4">
                  <label htmlFor="datepicker" className="block text-sm font-medium text-gray-700">
                    Select:
                  </label>
                  <input
                    type="date"
                    id="datepicker"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-2 block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500 transition-all ease-in-out duration-200"
                  />
                </div>

                {/* Custom Dropdown List */}
                <div className="mb-4">
                  <label htmlFor="dropdown" className="block text-sm font-medium text-gray-700">
                    Select a Project Repo:
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="dropdown"
                      value={selectedOption}
                      onChange={handleOptionChange}
                      className="block w-full px-4 py-3 border rounded-lg appearance-none focus:outline-none focus:ring focus:ring-blue-500 bg-gray-50 text-gray-900 transition-all ease-in-out duration-200"
                    >
                      <option value="">-- Choose a Project --</option>
                      <option value="Cortext_Flow">Cortext-Flow</option>
                      <option value="Decision">Decision</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Doc-App">Doc-App</option>
                      <option value="Elearning">Elearning</option>
                      <option value="Im-nextgen">Im-nextgen</option>
                      <option value="Sapient">Sapient</option>
                      <option value="training-center">Training-Center</option>
                      <option value="minotaur_rbac">Minotaur_Rbac</option>
                      <option value="notification">Notification</option>
                      <option value="extractor">Extractor</option>
                      <option value="minautor-rbac">Minautor-rbac</option>
                      <option value="minotaur_core">Minotaur_core</option>






                    </select>
                    <div className="absolute right-4 top-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Report Display */}
                {loading ? (
  <p className="text-blue-500">Loading report...</p>
) : reports ? (
  <div className="space-y-4">
    <button
      onClick={() => setReports(null)}
      className="text-blue-600 hover:text-blue-800 font-medium"
    >
      ← Back 
    </button>
    <div
      className="bg-white p-4 rounded-lg shadow-lg"
      dangerouslySetInnerHTML={{ __html: reports }}
    />
  </div>
) : (
  <p className="text-gray-500">No reports available</p>
)}
              </div>
            )}
          </main>
        </div>

        {/* Chat-like Popup */}
        {showPopup && (
          <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
            <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
              <span className="font-bold">Z-Vision AI Chat</span>
              <button
                onClick={togglePopup}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-2">
              <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
                <p className="text-sm">Hello! How can I assist you today?</p>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                />
                <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Popup */}
        {errorPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-red-600">Error</h2>
                <button
                  onClick={() => setErrorPopup(false)} // Close the popup
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-700">{error}</p>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setErrorPopup(false)} // Close the popup
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MsalProvider>
  );
}

export default App;
