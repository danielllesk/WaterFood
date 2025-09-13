import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import searchInputIcon from "@/assets/searchIcon.png";
import closeIcon from "@/assets/csb.png";

interface SearchResult {
  place_id: string;
  name: string;
  address: string;
  description: string;
}

interface RestaurantSearchInputProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const RestaurantSearchInput = ({ isMobile = false, onClose }: RestaurantSearchInputProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = (searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&location=Waterloo, Kitchener, ON, Canada`);
          const data = await response.json();
          
          if (response.ok && data.results) {
            setSuggestions(data.results.slice(0, 5)); // Limit to 5 suggestions
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // 500ms debounce
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length >= 3) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && query !== "") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: SearchResult) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    navigateToRestaurant(suggestion.place_id);
  };

  // Handle search
  const handleSearch = () => {
    if (query !== "") {
      setShowSuggestions(false);
      navigateToResults();
    }
  };

  // Navigate to restaurant detail page
  const navigateToRestaurant = (placeId: string) => {
    router.push(`/restaurant/${placeId}`);
    setQuery("");
    onClose?.();
  };

  // Navigate to results page
  const navigateToResults = () => {
    router.push(`/results?searchTerm=${encodeURIComponent(query)}`);
    setQuery("");
    onClose?.();
  };

  // Close search
  const handleClose = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onClose?.();
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (isMobile) {
    return (
      <div className="search-bar-mobile bg-h-blue active absolute left-0 top-[2.3rem] z-50 flex w-full p-4">
        <label htmlFor="search" className="hidden">
          Search restaurants:
        </label>
        <div className="relative w-full">
          <input
            ref={inputRef}
            id="search"
            type="text"
            className="bg-input-bg text-drop-grey h-9 w-full rounded py-1.5 pl-2.5 pr-8 text-base focus:bg-white focus:outline-none"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search restaurants..."
          />
          <Image
            src={searchInputIcon}
            onClick={handleSearch}
            width={40}
            height={40}
            className="absolute left-[85%]"
            alt="search icon"
            aria-label="press this search icon for performing a new search"
          />
          
          {/* Mobile suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.place_id}
                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <div className="font-medium text-gray-900">{suggestion.name}</div>
                  <div className="text-sm text-gray-600">{suggestion.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-2 flex items-center">
      <Image
        className="close-search-icon-desktop hover:cursor-pointer"
        src={closeIcon}
        width={25}
        height={25}
        alt="close search"
        onClick={handleClose}
      />
      <div className="relative">
        <label htmlFor="search" className="hidden">
          Search restaurants:
        </label>
        <input
          ref={inputRef}
          id="search"
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="bg-input-bg text-drop-grey h-8 rounded-2xl py-1.5 pl-2.5 pr-7 text-base focus:outline-none md:w-[150px]"
          placeholder="Search restaurants..."
        />
        <Image
          src={searchInputIcon}
          onClick={handleSearch}
          width={20}
          height={20}
          alt="search icon"
          className="relative left-[-30px] hover:cursor-pointer"
        />
        
        {/* Desktop suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[300px]">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id}
                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => selectSuggestion(suggestion)}
              >
                <div className="font-medium text-gray-900">{suggestion.name}</div>
                <div className="text-sm text-gray-600">{suggestion.address}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 p-3">
            <div className="text-sm text-gray-600">Searching...</div>
          </div>
        )}
      </div>
    </div>
  );
};
