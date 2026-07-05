# AI Chatbot with OpenRouter Integration

A modern, feature-rich chatbot application built with React that integrates with AI models via OpenRouter. The application provides a clean, intuitive interface for conversing with AI models while tracking usage costs in real-time with automatically updated pricing.

## 🌟 Features

### Core Functionality
- **Multiple AI Models**: Choose from various models including:
  - GPT-4o Mini
  - GPT-5.4 Nano
  - Gemini 3.5 Flash
  - DeepSeek V4 Flash
  - Claude Haiku 4.5

- **Auto-updating Pricing**: Model costs are fetched from OpenRouter on first visit and cached for 24 hours. Prices are always up-to-date without manual updates.

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
- OpenRouter API key (or any OpenAI-compatible API key)

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
   REACT_APP_API_KEY=your_openrouter_api_key_here
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
1. When you first open the application, you'll be prompted to enter your OpenRouter API key
2. The API key is stored in your browser's local storage for future sessions
3. You can update the API key anytime by clearing localStorage or through the interface

### Chatting with the AI
1. Type your message in the input box at the bottom
2. Press the send button or use Enter (if enabled) to send
3. The AI's response will appear in the chat window
4. Cost information is displayed as a toast notification after each response

### Customizing Behavior
- **Model Selection**: Use the dropdown to select your preferred model. Pricing is fetched from OpenRouter and cached locally for 24 hours
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
│   ├── modelData.js           # Dynamic model pricing (fetched from OpenRouter)
│   ├── defaultModels.json     # Snapshot of all models for first-time cache seed
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
- **Auto-updated pricing**: Model costs are fetched from OpenRouter on first visit and cached locally for 24 hours
- **Dynamic conversion rate**: USD to INR rate is fetched from the currency API on app load
- **Fallback rate**: If the API fails, defaults to 90 INR per USD

Cost is displayed in **Paise** (1/100th of a Rupee) for precision.

### Model Pricing

Model pricing is fetched dynamically from OpenRouter's API (`GET https://openrouter.ai/api/v1/models`) and cached in your browser's localStorage for 24 hours. A snapshot of the pricing is also committed in `src/defaultModels.json` so first-time visitors see real prices immediately without an API call.

| Feature | Description |
|---------|-------------|
| **Automatic updates** | Prices refresh from OpenRouter on page visit if cache is stale (>24h) |
| **Offline fallback** | Cached prices used immediately; background fetch refreshes silently |
| **COT detection** | Models supporting reasoning get the effort dropdown automatically |

### Adding New Models

Edit `src/modelData.js` — add the model ID to the `MODEL_IDS` array:

```javascript
export const MODEL_IDS = [
  "openai/gpt-4o-mini",
  "openai/gpt-5.4-nano",
  "google/gemini-3.5-flash",
  "deepseek/deepseek-v4-flash",
  "anthropic/claude-haiku-4.5",
  // "your-new-model-id",  ← add new model IDs here
];
```

Pricing and COT support are fetched from the API automatically — no need to enter costs manually.

### Changing Default Settings

In `src/Chatbot.jsx`, you can modify:
- Default model: `useState("openai/gpt-4o-mini")`
- Default custom instruction: `useState("Always give me answer in brief")`
- Default theme: `useState(true)` for dark mode
- Default conversion rate: `useState(90)`

## 🛠️ Technologies Used

- **React** (18.2.0) - UI framework
- **OpenAI SDK** - AI model integration via OpenRouter
- **Highlight.js** - Code syntax highlighting
- **KaTeX** - Mathematical expression rendering
- **React Hot Toast** - Toast notifications
- **Heroicons** - Icon library
- **Bootstrap** - UI components
- **React Bootstrap** - Bootstrap components for React

## 🌐 API Integration

### OpenRouter API
The app routes through OpenRouter for broad model access:
```
POST https://openrouter.ai/api/v1/chat/completions
```

Model pricing is fetched from:
```
GET https://openrouter.ai/api/v1/models
```
Responses are cached in localStorage for 24 hours with automatic background refresh.

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
- Verify your OpenRouter API key is valid
- Check your OpenRouter account has sufficient credits
- Ensure you have access to the models you're trying to use

**Cost Calculation Shows "Model not found"**
- Ensure the model ID in `MODEL_IDS` (in `src/modelData.js`) matches exactly with OpenRouter's model IDs as returned by the API

**Model Dropdown Shows "Loading models..."**
- Usually a temporary state during the first API fetch — the dropdown should populate within a few seconds
- Check browser console for network errors if it persists

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

**Note**: This application requires an active OpenRouter API key and internet connection to function. API usage costs are charged by OpenRouter/OpenAI according to their pricing structure, which is displayed in the app via auto-fetched pricing data.
