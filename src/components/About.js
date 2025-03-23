import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                AI Model Advisor
              </a>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="/documentation" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                Documentation
              </a>
              <a href="/about" className="text-gray-900 border-b-2 border-primary-600 px-3 py-2 text-sm font-medium">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6">About AI Model Advisor</h1>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <p className="text-blue-800 font-medium">
              This project was created as part of the Sundai Hackathon in March 2025.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-gray-700 mb-4">
                AI Model Advisor is a modern web application designed to help corporations find the best AI models 
                for their specific needs. With the rapidly growing number of AI models available today, choosing 
                the right one for your use case can be challenging.
              </p>
              <p className="text-gray-700 mb-4">
                Our tool helps businesses compare different AI models based on cost, speed, accuracy, and other 
                relevant factors, making it easier to make informed decisions about AI implementation.
              </p>
              <p className="text-gray-700">
                Through objective, data-driven comparisons, AI Model Advisor empowers organizations to select 
                the most suitable AI models for their specific requirements, optimizing both performance and cost.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/images/diagram.png" 
                alt="AI Model Advisor Diagram" 
                className="rounded-lg shadow-md max-w-full h-auto"
              />
            </div>
          </div>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Intuitive UI</h3>
                <p className="text-gray-600">
                  Clean, modern interface for easy navigation and a smooth user experience
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">Visual Comparisons</h3>
                <p className="text-gray-600">
                  Compare models with interactive charts to easily visualize performance differences
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 mb-2">Comprehensive Information</h3>
                <p className="text-gray-600">
                  Get detailed information about each AI model's capabilities and limitations
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Use Case Matching</h3>
                <p className="text-gray-600">
                  Find models that specifically match your business needs and requirements
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-800 mb-2">AI-Powered Evaluation</h3>
                <p className="text-gray-600">
                  Advanced AI-based evaluation of model responses for objective comparison
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-800 mb-2">Cost Transparency</h3>
                <p className="text-gray-600">
                  Clear information about the cost implications of using different models
                </p>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Technologies Used</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>React</strong> - Frontend library for building user interfaces</li>
              <li><strong>Tailwind CSS</strong> - Utility-first CSS framework for styling</li>
              <li><strong>Chart.js</strong> - JavaScript library for data visualization</li>
              <li><strong>Headless UI</strong> - Unstyled, accessible UI components</li>
              <li><strong>OpenRouter API</strong> - For accessing various AI models</li>
              <li><strong>AI21 Maestro API</strong> - For generating test prompts and evaluations</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Future Enhancements</h2>
            <p className="text-gray-700 mb-4">
              We're constantly working to improve AI Model Advisor. Here are some features we plan to add in the future:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>User accounts to save preferences and previous comparisons</li>
              <li>More detailed model comparison tools with additional metrics</li>
              <li>Case studies for each model to showcase real-world applications</li>
              <li>Integration with APIs to get real-time pricing information</li>
              <li>Advanced recommendation engine based on more complex criteria</li>
            </ul>
          </section>
        </div>
      </main>
      
      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2025 AI Model Advisor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About; 