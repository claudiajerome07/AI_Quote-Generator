"use client";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Quote,
  RefreshCw,
  Copy,
  Check,
  Moon,
  Sun,
} from "lucide-react";

export default function Home() {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("motivation");

  // Quote categories
  const categories = [
    { value: "motivation", label: "💪 Motivation" },
    { value: "success", label: "🚀 Success" },
    { value: "life", label: "🌿 Life" },
    { value: "wisdom", label: "📚 Wisdom" },
    { value: "creativity", label: "🎨 Creativity" },
    { value: "perseverance", label: "🛣️ Perseverance" },
    { value: "love", label: "❤️ Love" },
    { value: "inspiration", label: "✨ Inspiration" },
  ];

  // Enhanced quote cleaning function
  const cleanQuote = (text: string) => {
    if (!text) return "";

    // Remove markdown bold formatting
    let cleaned = text.replace(/\*\*/g, "");

    // Remove option patterns like "Option 1:", "Option 2:", etc.
    cleaned = cleaned.replace(/Option\s*\d+\s*[:\-]/gi, "");

    // Remove any leading/trailing quotes and whitespace
    cleaned = cleaned.replace(/^["']|["']$/g, "").trim();

    // If it still has multiple lines, take the first substantial one
    const lines = cleaned.split("\n").filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith(">") &&
        !trimmed.match(/^[#*-]/) &&
        !trimmed.match(/^Option\s*\d+/i)
      );
    });

    if (lines.length > 0) {
      // Return the longest line (likely the actual quote)
      const longestLine = lines.reduce((longest, current) =>
        current.length > longest.length ? current : longest
      );
      return longestLine.trim();
    }

    return cleaned;
  };

  // Fetch quote from FastAPI backend
  const fetchQuote = async (category: string = selectedCategory) => {
    try {
      setLoading(true);
      setQuote(""); // Clear previous quote immediately
      const response = await fetch(
        `http://127.0.0.1:8000/quote?category=${category}`
      );
      if (!response.ok) throw new Error("Failed to fetch quote");
      const data = await response.json();

      // Clean the quote before setting it
      const cleanedQuote = cleanQuote(data.quote);
      setQuote(cleanedQuote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuote("Failed to load quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (quote) {
      await navigator.clipboard.writeText(quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <main
      className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 text-gray-800"
      }`}
    >
      <div className="max-w-2xl w-full space-y-8">
        {/* Header with Dark Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl shadow-lg ${
                darkMode
                  ? "bg-gradient-to-r from-blue-600 to-purple-600"
                  : "bg-gradient-to-r from-blue-500 to-purple-600"
              }`}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1
              className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
                darkMode ? "from-blue-400 to-purple-400" : ""
              }`}
            >
              InspiroAI
            </h1>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-2xl transition-all duration-300 ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-yellow-300"
                : "bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
            }`}
          >
            {darkMode ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Subtitle */}
        <div className="text-center">
          <p
            className={`text-lg max-w-md mx-auto ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Discover AI-generated inspirational quotes to brighten your day
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => {
                setSelectedCategory(category.value);
                fetchQuote(category.value);
              }}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedCategory === category.value
                  ? darkMode
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Quote Card */}
        <div className="relative">
          {/* Decorative elements */}
          <div
            className={`absolute -top-4 -left-4 w-8 h-8 opacity-60 ${
              darkMode ? "text-blue-400" : "text-blue-300"
            }`}
          >
            <Quote className="w-full h-full" />
          </div>
          <div
            className={`absolute -bottom-4 -right-4 w-8 h-8 opacity-60 rotate-180 ${
              darkMode ? "text-purple-400" : "text-purple-300"
            }`}
          >
            <Quote className="w-full h-full" />
          </div>

          <div
            className={`rounded-3xl shadow-2xl border p-8 transition-all duration-300 min-h-[280px] flex items-center justify-center ${
              darkMode
                ? "bg-gray-800/80 backdrop-blur-sm border-gray-700"
                : "bg-white/80 backdrop-blur-sm border-white/20"
            } ${
              loading ? "animate-pulse" : "hover:shadow-2xl hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div
                    className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                      darkMode ? "border-blue-400" : "border-blue-500"
                    }`}
                  ></div>
                </div>
                <p
                  className={`text-lg font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Crafting your inspiration...
                </p>
              </div>
            ) : quote ? (
              <div className="space-y-6 w-full">
                <div className="text-center space-y-4">
                  <p
                    className={`text-xl md:text-2xl font-light leading-relaxed italic break-words whitespace-pre-line ${
                      darkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    "{quote}"
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        darkMode
                          ? "bg-gradient-to-r from-blue-400 to-purple-400"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                      }`}
                    ></div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      AI Generated •{" "}
                      {
                        categories
                          .find((cat) => cat.value === selectedCategory)
                          ?.label.split(" ")[1]
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      darkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                    title="Copy quote"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  No quote available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={() => fetchQuote(selectedCategory)}
            disabled={loading}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {loading ? "Generating..." : "Generate New Quote"}

            {/* Animated background effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Powered by Gemini AI • Made with ❤️
          </p>
        </div>
      </div>
    </main>
  );
}
