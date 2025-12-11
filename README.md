# AI Chatbot with OpenAI Integration

A modern, feature-rich chatbot application built with React that integrates with OpenAI's GPT models. The application provides a clean, intuitive interface for conversing with AI models while tracking usage costs in real-time.

## 🌟 Features

### Core Functionality
- **Multiple GPT Models Support**: Choose from various OpenAI models including:
  - GPT-5 Nano
  - GPT-5 Mini
  - GPT-5.1 (with Chain-of-Thought reasoning)
  - GPT-4o Mini

- **Real-time Cost Tracking**: Automatically calculates and displays the cost of each API call in Indian Paise, with dynamic USD to INR conversion rates fetched from a live API

- **Context Management**: Toggle conversation context retention to control whether the AI remembers previous messages

- **Custom Instructions**: Set personalized system instructions to guide the AI's responses

- **JSON Output Mode**: Request responses in JSON format for structured data

- **Chain-of-Thought (COT) Reasoning**: For supported models, adjust reasoning effort levels (Low, Medium, High)

### User Experience
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Syntax Highlighting**: Code blocks are automatically highlighted using highlight.js
- **LaTeX Math Rendering**: Mathematical expressions are rendered beautifully using KaTeX
- **Copy to Clipboard**: Click on any message to copy it to clipboard
- **Auto-scrolling**: Messages automatically scroll into view
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: Real-time feedback for actions and errors

### Security
- **API Key Protection**: Secure API key input with password-protected access
- **Environment Variables**: Production API keys can be stored in `.env.production`

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   
   Create a `.env.production` file in the root directory:
   ```
   REACT_APP_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will run on `http://localhost:3001`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 📖 Usage

### First Time Setup
1. When you first open the application, you'll be prompted to enter your OpenAI API key
2. The API key is stored in your browser's local storage for future sessions
3. You can update the API key anytime through the settings

### Chatting with the AI
1. Type your message in the input box at the bottom
2. Press the send button or use Enter (if enabled) to send
3. The AI's response will appear in the chat window
4. Cost information is displayed as a toast notification after each response

### Customizing Behavior
- **Model Selection**: Use the dropdown to select your preferred GPT model
- **Context Toggle**: Enable/disable conversation context retention
- **JSON Mode**: Check the JSON box to receive structured responses
- **Custom Instructions**: Click the settings icon to set custom system instructions
- **Reasoning Effort**: For COT-enabled models, adjust the reasoning depth

### Managing Conversations
- **Clear Chat**: Click the trash icon to start a new conversation
- **Theme Toggle**: Click the sun/moon icon to switch between light and dark modes

## 🏗️ Project Structure

```
chatbot/
├── public/
│   └── index.html
├── src/
│   ├── APIKeyInputPage.jsx    # API key input interface
│   ├── App.js                 # Main app component with routing logic
│   ├── Chatbot.jsx            # Core chatbot component
│   ├── CustomModal.jsx        # Modal for custom instructions
│   ├── passwordPage.jsx       # Password protection page
│   ├── constants.js           # Model configurations and pricing
│   ├── utils.js               # Utility functions (cost calculation)
│   ├── styles.css             # Application styles
│   └── index.js               # React entry point
├── .env.production            # Production environment variables
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 💰 Cost Calculation

The application automatically calculates costs based on:
- **Input tokens**: Charged per the model's input pricing
- **Output tokens**: Charged per the model's output pricing
- **Dynamic conversion rate**: USD to INR rate is fetched from the currency API on app load
- **Fallback rate**: If the API fails, defaults to 90 INR per USD

Cost is displayed in **Paise** (1/100th of a Rupee) for precision.

### Model Pricing (per 1M tokens)

| Model | Input Cost | Output Cost | COT Support |
|-------|-----------|-------------|-------------|
| GPT-5 Nano | $0.05 | $0.40 | No |
| GPT-5 Mini | $0.25 | $2.00 | No |
| GPT-5.1 | $1.25 | $10.00 | Yes |
| GPT-4o Mini | $0.15 | $0.60 | No |

## 🔧 Configuration

### Adding New Models

Edit `src/constants.js`:

```javascript
export const models = [
  {
    model_name: "model-name",
    inputCost: "$X.XX",
    outputCost: "$Y.YY",
    isCOT: false, // or true for Chain-of-Thought models
  },
  // ... more models
];
```

### Changing Default Settings

In `src/Chatbot.jsx`, you can modify:
- Default model: `useState("gpt-5-nano")`
- Default custom instruction: `useState("Always give me answer in brief")`
- Default theme: `useState(true)` for dark mode
- Default conversion rate: `useState(90)`

## 🛠️ Technologies Used

- **React** (18.2.0) - UI framework
- **OpenAI API** - AI model integration
- **Highlight.js** - Code syntax highlighting
- **KaTeX** - Mathematical expression rendering
- **React Hot Toast** - Toast notifications
- **Heroicons** - Icon library
- **Bootstrap** - UI components
- **React Bootstrap** - Bootstrap components for React

## 🌐 API Integration

### OpenAI API
The app uses OpenAI's Chat Completions API:
```
POST https://api.openai.com/v1/chat/completions
```

### Currency Conversion API
Dynamic USD to INR rates are fetched from:
```
GET https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json
```

## 🎨 Customization

### Styling
All styles are in `src/styles.css`. The application supports both dark and light modes with CSS classes:
- `.dark-mode` - Applied to body for dark theme
- Custom CSS variables can be added for easy theme customization

### Features
You can enable/disable features by modifying state variables in `Chatbot.jsx`:
- Enter-to-send functionality (currently hidden)
- Context retention
- JSON format output

## 🐛 Troubleshooting

### Common Issues

**API Key Not Working**
- Verify your OpenAI API key is valid
- Check your OpenAI account has sufficient credits
- Ensure you have access to the models you're trying to use

**Cost Calculation Shows "Model not found"**
- Ensure the model name in `constants.js` matches exactly with OpenAI's model names

**Currency Rate Not Updating**
- Check browser console for API errors
- Verify internet connection
- The app will use the fallback rate (90) if the API fails

**Messages Not Displaying Properly**
- Clear browser cache
- Check browser console for JavaScript errors

## 📝 License

This project was created with CodeSandbox.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Note**: This application requires an active OpenAI API key and internet connection to function. API usage costs are charged by OpenAI according to their pricing structure.
