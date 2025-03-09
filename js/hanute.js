class Hanute {
  constructor() {
    // Predefined answers database
    this.answers = {
      "hello": "Hello! I'm Hanute, your assistant for Gurasuraisu. How can I help you today?",
      "help": "I can provide information about Gurasuraisu, assist with common tasks, or answer frequently asked questions.",
      "what is gurasuraisu": "Gurasuraisu is a project focused on [your project description here].",
      "contact": "You can reach the Gurasuraisu team at [contact information].",
      "features": "Gurasuraisu offers the following features: [list your features].",
      // Add more predefined Q&A pairs
    };
    
    this.fallbackThreshold = 0.4; // Confidence threshold for matching
    
    // Initialize speech recognition if browser supports it
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US'; // Set language
      
      // Setup recognition event handlers
      this.setupVoiceRecognition();
    } else {
      console.warn("Speech recognition not supported in this browser");
    }
  }
  
  // Setup voice recognition event handlers
  setupVoiceRecognition() {
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('user-input').value = transcript;
      
      // Process the voice input
      const response = this.processInput(transcript);
      document.getElementById('response').textContent = response;
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      document.getElementById('response').textContent = "Sorry, I couldn't understand that. Please try again.";
    };
  }
  
  // Start listening for voice input
  startListening() {
    try {
      this.recognition.start();
      document.getElementById('response').textContent = "Listening...";
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }
  
  // Stop listening
  stopListening() {
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }

  // Process user input
  processInput(userInput) {
    const cleanInput = userInput.toLowerCase().trim();
    
    // Check for exact matches
    if (this.answers[cleanInput]) {
      return this.answers[cleanInput];
    }
    
    // Check for partial matches
    const matchResult = this.findBestMatch(cleanInput);
    if (matchResult.confidence >= this.fallbackThreshold) {
      return this.answers[matchResult.key];
    }
    
    // Fallback to ChatGPT webpage
    this.openChatGPT(userInput);
    return "I don't have a predefined answer for that. I've opened ChatGPT where you can ask this question.";
  }
  
  // Find best match from predetermined answers
  findBestMatch(input) {
    let bestMatch = { key: null, confidence: 0 };
    
    for (const key in this.answers) {
      const similarity = this.calculateSimilarity(input, key);
      if (similarity > bestMatch.confidence) {
        bestMatch = { key, confidence: similarity };
      }
    }
    
    return bestMatch;
  }
  
  // Simple similarity calculation
  calculateSimilarity(input, key) {
    // Count how many words from the key appear in the input
    const inputWords = input.split(' ');
    const keyWords = key.split(' ');
    
    let matchCount = 0;
    keyWords.forEach(word => {
      if (inputWords.includes(word)) matchCount++;
    });
    
    return keyWords.length > 0 ? matchCount / keyWords.length : 0;
  }
  
  // Open ChatGPT with the user query
  openChatGPT(query) {
    window.open(`https://chat.openai.com/`, '_blank');
  }
}

// Example usage with UI elements
document.addEventListener('DOMContentLoaded', () => {
  const hanute = new Hanute();
  
  // Text input button
  document.getElementById('send-button').addEventListener('click', () => {
    const userInput = document.getElementById('user-input').value;
    const responseElement = document.getElementById('response');
    
    const response = hanute.processInput(userInput);
    responseElement.textContent = response;
  });
  
  // Voice input button
  document.getElementById('voice-button').addEventListener('click', () => {
    hanute.startListening();
  });
});
