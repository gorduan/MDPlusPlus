/**
 * MD++ Search & Replace Component
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SearchReplaceProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onReplace: (newContent: string) => void;
  mode: 'find' | 'replace';
}

interface SearchMatch {
  index: number;
  length: number;
  line: number;
  column: number;
}

export default function SearchReplace({
  isOpen,
  onClose,
  content,
  onReplace,
  mode,
}: SearchReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen]);

  // Find all matches
  const findMatches = useCallback(() => {
    if (!searchTerm) {
      setMatches([]);
      return;
    }

    try {
      let pattern: RegExp;
      let searchPattern = searchTerm;

      if (!useRegex) {
        // Escape special regex characters
        searchPattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      if (wholeWord) {
        searchPattern = `\\b${searchPattern}\\b`;
      }

      pattern = new RegExp(searchPattern, caseSensitive ? 'g' : 'gi');

      const foundMatches: SearchMatch[] = [];
      let match: RegExpExecArray | null;
      const lines = content.split('\n');

      while ((match = pattern.exec(content)) !== null) {
        // Calculate line and column
        let charCount = 0;
        let line = 0;
        for (let i = 0; i < lines.length; i++) {
          if (charCount + lines[i].length >= match.index) {
            line = i + 1;
            break;
          }
          charCount += lines[i].length + 1; // +1 for newline
        }
        const column = match.index - charCount + 1;

        foundMatches.push({
          index: match.index,
          length: match[0].length,
          line,
          column,
        });

        // Prevent infinite loop for zero-length matches
        if (match[0].length === 0) {
          pattern.lastIndex++;
        }
      }

      setMatches(foundMatches);
      if (foundMatches.length > 0 && currentMatch >= foundMatches.length) {
        setCurrentMatch(0);
      }
    } catch (e) {
      // Invalid regex
      setMatches([]);
    }
  }, [searchTerm, content, caseSensitive, useRegex, wholeWord, currentMatch]);

  // Update matches when search parameters change
  useEffect(() => {
    findMatches();
  }, [findMatches]);

  // Navigate to next match
  const goToNext = () => {
    if (matches.length > 0) {
      setCurrentMatch((prev) => (prev + 1) % matches.length);
    }
  };

  // Navigate to previous match
  const goToPrev = () => {
    if (matches.length > 0) {
      setCurrentMatch((prev) => (prev - 1 + matches.length) % matches.length);
    }
  };

  // Replace current match
  const replaceCurrent = () => {
    if (matches.length === 0 || !matches[currentMatch]) return;

    const match = matches[currentMatch];
    const newContent =
      content.substring(0, match.index) +
      replaceTerm +
      content.substring(match.index + match.length);

    onReplace(newContent);
  };

  // Replace all matches
  const replaceAll = () => {
    if (matches.length === 0 || !searchTerm) return;

    try {
      let searchPattern = searchTerm;

      if (!useRegex) {
        searchPattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      if (wholeWord) {
        searchPattern = `\\b${searchPattern}\\b`;
      }

      const pattern = new RegExp(searchPattern, caseSensitive ? 'g' : 'gi');
      const newContent = content.replace(pattern, replaceTerm);
      onReplace(newContent);
    } catch (e) {
      // Invalid regex
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        goToPrev();
      } else {
        goToNext();
      }
    } else if (e.key === 'F3') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrev();
      } else {
        goToNext();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-replace-panel" onKeyDown={handleKeyDown}>
      <div className="search-replace-header">
        <span className="search-replace-title">
          {mode === 'find' ? 'Suchen' : 'Suchen & Ersetzen'}
        </span>
        <button className="search-replace-close" onClick={onClose} title="Schließen (Esc)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M1.41 1.41L7 6.99l5.59-5.58L14 2.82 8.41 8.4 14 14l-1.41 1.41L7 9.83l-5.59 5.58L0 14l5.59-5.59L0 2.82z" />
          </svg>
        </button>
      </div>

      <div className="search-replace-body">
        <div className="search-row">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="search-nav">
            <button onClick={goToPrev} disabled={matches.length === 0} title="Vorheriger (Shift+Enter)">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 2L1 7h10L6 2z" />
              </svg>
            </button>
            <button onClick={goToNext} disabled={matches.length === 0} title="Nächster (Enter)">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 10L1 5h10L6 10z" />
              </svg>
            </button>
          </div>
          <span className="search-count">
            {matches.length > 0 ? `${currentMatch + 1}/${matches.length}` : 'Keine Treffer'}
          </span>
        </div>

        {mode === 'replace' && (
          <div className="search-row">
            <input
              type="text"
              className="search-input"
              placeholder="Ersetzen durch..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
            />
            <div className="replace-buttons">
              <button onClick={replaceCurrent} disabled={matches.length === 0} title="Ersetzen">
                Ersetzen
              </button>
              <button onClick={replaceAll} disabled={matches.length === 0} title="Alle ersetzen">
                Alle
              </button>
            </div>
          </div>
        )}

        <div className="search-options">
          <label className="search-option">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            <span>Aa</span>
            <span className="option-tooltip">Groß-/Kleinschreibung</span>
          </label>
          <label className="search-option">
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={(e) => setWholeWord(e.target.checked)}
            />
            <span>W</span>
            <span className="option-tooltip">Ganzes Wort</span>
          </label>
          <label className="search-option">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
            />
            <span>.*</span>
            <span className="option-tooltip">Regulärer Ausdruck</span>
          </label>
        </div>
      </div>
    </div>
  );
}
