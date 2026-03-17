import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center">
      <AnimatePresence>
        {isOpen && (
          <motion.form
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mr-1"
          >
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="搜尋熱話..."
              className="w-full bg-muted/50 border border-border rounded-full px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              data-testid="search-input"
            />
          </motion.form>
        )}
      </AnimatePresence>

      <button
        onClick={() => (isOpen ? handleClear() : setIsOpen(true))}
        className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        data-testid="search-toggle"
      >
        {isOpen ? (
          <X className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Search className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
