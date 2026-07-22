import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import KnowledgeManagement from "./pages/KnowledgeManagement.jsx";
import KnowledgeCreate from "./pages/KnowledgeCreate.jsx";
import KnowledgeView from "./pages/KnowledgeView.jsx";
import KnowledgeEdit from "./pages/KnowledgeEdit.jsx";
import SemanticSearch from "./pages/SemanticSearch.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/knowledge" element={<KnowledgeManagement />} />
        <Route path="/knowledge/new" element={<KnowledgeCreate />} />
        <Route path="/knowledge/:id" element={<KnowledgeView />} />
        <Route path="/knowledge/:id/edit" element={<KnowledgeEdit />} />
        <Route path="/search" element={<SemanticSearch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
