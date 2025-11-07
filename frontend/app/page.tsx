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
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  BookOpen,
} from "lucide-react";

interface Quote {
  id: number;
  text: string;
  category: string;
  author: string;
  created_at: string;
  is_ai_generated: boolean;
}

export default function Home() {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("motivation");
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [showSavedQuotes, setShowSavedQuotes] = useState<boolean>(false);
  const [showAddQuote, setShowAddQuote] = useState<boolean>(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [newQuote, setNewQuote] = useState({
    text: "",
    category: "motivation",
    author: "",
  });

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

    let cleaned = text.replace(/\*\*/g, "");
    cleaned = cleaned.replace(/Option\s*\d+\s*[:\-]/gi, "");
    cleaned = cleaned.replace(/^["']|["']$/g, "").trim();

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
      const longestLine = lines.reduce((longest, current) =>
        current.length > longest.length ? current : longest
      );
      return longestLine.trim();
    }

    return cleaned;
  };

  // Fetch AI-generated quote
  const fetchQuote = async (category: string = selectedCategory) => {
    try {
      setLoading(true);
      setQuote("");
      const response = await fetch(
        `http://127.0.0.1:8000/quote?category=${category}`
      );
      if (!response.ok) throw new Error("Failed to fetch quote");
      const data = await response.json();
      const cleanedQuote = cleanQuote(data.quote);
      setQuote(cleanedQuote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuote("Failed to load quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved quotes
  const fetchSavedQuotes = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/quotes");
      if (!response.ok) throw new Error("Failed to fetch saved quotes");
      const data = await response.json();
      setSavedQuotes(data);
    } catch (error) {
      console.error("Error fetching saved quotes:", error);
    }
  };

  // Save current AI quote
  const saveCurrentQuote = async () => {
    if (!quote) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: quote,
          category: selectedCategory,
          author: "AI Generated",
        }),
      });

      if (!response.ok) throw new Error("Failed to save quote");
      await fetchSavedQuotes();
      alert("Quote saved successfully!");
    } catch (error) {
      console.error("Error saving quote:", error);
      alert("Failed to save quote.");
    }
  };

  // Add custom quote
  const addCustomQuote = async () => {
    if (!newQuote.text.trim()) {
      alert("Please enter a quote");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newQuote.text,
          category: newQuote.category,
          author: newQuote.author || "Anonymous",
        }),
      });

      if (!response.ok) throw new Error("Failed to add quote");

      setNewQuote({ text: "", category: "motivation", author: "" });
      setShowAddQuote(false);
      await fetchSavedQuotes();
      alert("Quote added successfully!");
    } catch (error) {
      console.error("Error adding quote:", error);
      alert("Failed to add quote.");
    }
  };

  // Update quote
  const updateQuote = async () => {
    if (!editingQuote) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/quotes/${editingQuote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: editingQuote.text,
            category: editingQuote.category,
            author: editingQuote.author,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update quote");

      setEditingQuote(null);
      await fetchSavedQuotes();
      alert("Quote updated successfully!");
    } catch (error) {
      console.error("Error updating quote:", error);
      alert("Failed to update quote.");
    }
  };

  // Delete quote
  const deleteQuote = async (quoteId: number) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/quotes/${quoteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete quote");

      await fetchSavedQuotes();
      alert("Quote deleted successfully!");
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert("Failed to delete quote.");
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
    fetchSavedQuotes();
  }, []);

  return (
    <main
      className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 text-gray-800"
      }`}
    >
      <div className="max-w-4xl w-full space-y-8">
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

          <div className="flex gap-2">
            {/* Saved Quotes Toggle */}
            <button
              onClick={() => setShowSavedQuotes(!showSavedQuotes)}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-blue-300"
                  : "bg-white hover:bg-gray-100 text-blue-600 shadow-lg"
              }`}
              title="View Saved Quotes"
            >
              <BookOpen className="w-6 h-6" />
            </button>

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

        {/* Main Content */}
        {!showSavedQuotes ? (
          <>
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
                  loading
                    ? "animate-pulse"
                    : "hover:shadow-2xl hover:scale-[1.02]"
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

                      <button
                        onClick={saveCurrentQuote}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                          darkMode
                            ? "text-blue-300 hover:text-blue-200 hover:bg-gray-700"
                            : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        }`}
                        title="Save quote"
                      >
                        <Save className="w-5 h-5" />
                        <span className="text-sm font-medium">Save</span>
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

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
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
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>

              <button
                onClick={() => setShowAddQuote(true)}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Add Custom Quote
              </button>
            </div>
          </>
        ) : (
          /* Saved Quotes View */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Saved Quotes ({savedQuotes.length})
              </h2>
              <button
                onClick={() => setShowSavedQuotes(false)}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {savedQuotes.length === 0 ? (
                <div
                  className={`text-center py-8 rounded-2xl ${
                    darkMode ? "bg-gray-800/50" : "bg-white/50"
                  }`}
                >
                  <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                    No saved quotes yet. Generate and save some quotes!
                  </p>
                </div>
              ) : (
                savedQuotes.map((savedQuote) => (
                  <div
                    key={savedQuote.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                        : "bg-white/50 border-gray-200 hover:bg-white"
                    }`}
                  >
                    {editingQuote?.id === savedQuote.id ? (
                      <div className="space-y-4">
                        <textarea
                          value={editingQuote.text}
                          onChange={(e) =>
                            setEditingQuote({
                              ...editingQuote,
                              text: e.target.value,
                            })
                          }
                          className={`w-full p-3 rounded-lg border ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-800"
                          }`}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <select
                            value={editingQuote.category}
                            onChange={(e) =>
                              setEditingQuote({
                                ...editingQuote,
                                category: e.target.value,
                              })
                            }
                            className={`px-3 py-2 rounded-lg border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-800"
                            }`}
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editingQuote.author}
                            onChange={(e) =>
                              setEditingQuote({
                                ...editingQuote,
                                author: e.target.value,
                              })
                            }
                            placeholder="Author"
                            className={`flex-1 px-3 py-2 rounded-lg border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-800"
                            }`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={updateQuote}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingQuote(null)}
                            className={`px-4 py-2 rounded-lg ${
                              darkMode
                                ? "bg-gray-600 text-white hover:bg-gray-500"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            } transition-colors`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`text-lg italic mb-3 ${
                            darkMode ? "text-gray-100" : "text-gray-800"
                          }`}
                        >
                          "{savedQuote.text}"
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full ${
                                darkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {
                                categories.find(
                                  (c) => c.value === savedQuote.category
                                )?.label
                              }
                            </span>
                            <span
                              className={
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }
                            >
                              by {savedQuote.author}
                            </span>
                            {savedQuote.is_ai_generated && (
                              <span
                                className={`px-2 py-1 rounded-full ${
                                  darkMode
                                    ? "bg-blue-900/50 text-blue-300"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                AI
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingQuote(savedQuote)}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? "text-blue-300 hover:text-blue-200 hover:bg-gray-700"
                                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              }`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteQuote(savedQuote.id)}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? "text-red-300 hover:text-red-200 hover:bg-gray-700"
                                  : "text-red-600 hover:text-red-800 hover:bg-red-50"
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Add Quote Modal */}
        {showAddQuote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div
              className={`max-w-md w-full rounded-3xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Add Custom Quote
              </h3>

              <div className="space-y-4">
                <textarea
                  value={newQuote.text}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, text: e.target.value })
                  }
                  placeholder="Enter your inspirational quote..."
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  }`}
                  rows={4}
                />

                <div className="flex gap-2">
                  <select
                    value={newQuote.category}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, category: e.target.value })
                    }
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={newQuote.author}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, author: e.target.value })
                    }
                    placeholder="Your name"
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                    }`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addCustomQuote}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save Quote
                  </button>
                  <button
                    onClick={() => setShowAddQuote(false)}
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? "bg-gray-600 text-white hover:bg-gray-500"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Powered by Gemini AI • Made with ❤️ • {savedQuotes.length} quotes
            saved
          </p>
        </div>
      </div>
    </main>
  );
}
