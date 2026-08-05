import React from 'react';
import { SearchInput } from './ui/Input';

export default function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <SearchInput
      value={searchTerm}
      onChange={(val) => onSearchChange(val)}
      onClear={() => onSearchChange('')}
      placeholder="Search tasks, categories, or keywords..."
    />
  );
}