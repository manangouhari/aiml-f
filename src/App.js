import { useState, useEffect, useRef } from "react";

const URL = "http://127.0.0.1:8000";

const fetchAnalysis = async (text) => {
  const resp = await fetch(`${URL}/analyse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
    }),
  });
  return await resp.json();
};

export default function App() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);

  async function onClick() {
    const analysisResp = await fetchAnalysis(text);
    setAnalysis(analysisResp);
  }
  return (
    <main className="flex flex-col h-screen overflow-hidden relative">
      <Header />
      <main className="flex w-full flex-1 text-lg relative">
        <Writing text={text} setText={setText} />
        <Analysis analysis={analysis} />
        <AnalyseButton handler={onClick} />
      </main>
      <Footer />
    </main>
  );
}

const AnalyseButton = ({ handler }) => (
  <button
    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-teal-200 hover:bg-teal-300 text-gray-600 rounded-full p-5 border-4 border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
    onClick={handler}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
      />
    </svg>
  </button>
);

const Header = () => (
  <header className="px-12 h-20 flex items-center justify-center border-b-4 border-gray-600 text-gray-600">
    <h1 className="text-3xl font-bold">scrivi</h1>
  </header>
);

const Footer = () => (
  <footer className="px-12 py-4 border-t-4 border-gray-600">
    Made by Gunika, Anushka, and Manan.
  </footer>
);

const Writing = ({ text, setText }) => {
  const inpRef = useRef();
  useEffect(() => {
    inpRef.current.focus();
  }, []);
  return (
    <section className="border-r-2 border-gray-600 w-1/2">
      <textarea
        ref={inpRef}
        className="w-full h-full focus:outline-none px-16 py-8"
        placeholder="Start writing here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
    </section>
  );
};

const Summary = ({ result }) => {
  const sorted = Object.keys(result.tfidf)
    .sort((a, b) => result.tfidf[b] - result.tfidf[a])
    .slice(0, Math.max(1, Math.round(result.stats.sentences * 0.2)));

  return (
    <div className="mt-6">
      <h4 className="text-2xl">Summary</h4>
      <ul className="list-disc list-inside mt-2">
        {sorted.map((s) => (
          <li>{s}</li>
        ))}
      </ul>
    </div>
  );
};

const Sentiment = ({ s }) => (
  <p className="mt-2">
    It sounds{" "}
    <span
      className={`${
        s.includes("Positive")
          ? "text-green-700"
          : s.includes("Negative")
          ? "text-red-400"
          : "text-gray-700"
      } font-bold`}
    >
      {s}
    </span>
  </p>
);

const Intent = ({ intent }) => {
  let i = "";
  let val = -1;

  for (let k of Object.keys(intent)) {
    if (intent[k] > val) {
      val = intent[k];
      i = k;
    }
  }

  const MAPPING = {
    descriptive: "describe",
    informative: "inform",
    story: "tell a story",
    persuasive: "convince",
  };

  return (
    <p className="mt-1">
      It is trying to <span className="font-bold">{MAPPING[i]}</span>
    </p>
  );
};

const Analysis = ({ analysis }) => {
  return (
    <section className="bg-gray-100 w-1/2 border-l-2 border-gray-600 px-16 py-8">
      {analysis && (
        <>
          <h2 className="text-3xl">Analysis</h2>
          <div className="mt-10">
            <div className="grid grid-cols-3 gap-x-4">
              <div className="bg-gray-200 rounded px-4 py-2">
                <h3 className="text-xl">{analysis["stats"]["sentences"]}</h3>
                <p className="text-sm">Number of sentences</p>
              </div>
              <div className="bg-gray-200 rounded px-4 py-2">
                <h3 className="text-xl">{analysis["stats"]["words"]}</h3>
                <p className="text-sm">Number of words</p>
              </div>
              <div className="bg-gray-200 rounded px-4 py-2">
                <h3 className="text-xl">{analysis["stats"]["stopwords"]}</h3>
                <p className="text-sm">Stopwords used</p>
              </div>
            </div>
            <div className="mt-10">
              <h4 className="text-2xl">Nature of text</h4>
              <Sentiment s={analysis.sentiment} />
              <Intent intent={analysis.intent} />
            </div>
            <Summary result={analysis} />
          </div>
        </>
      )}
    </section>
  );
};
