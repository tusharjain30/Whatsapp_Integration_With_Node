const SearchBar = ({ value, onChange }) => {
  return (
    <div className="p-2">
      <input
        className="w-full px-3 py-2 text-sm bg-slate-100 rounded-full outline-none"
        placeholder="Search or start a new chat"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
