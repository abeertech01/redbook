import React, { useState } from "react"
import { Input } from "./ui/input"

// Mock data for demonstration
const profiles = [
  { id: 1, name: "Alice Anderson" },
  { id: 2, name: "Bob Brown" },
  { id: 3, name: "Charlie Clark" },
  { id: 4, name: "Daisy Davis" },
  { id: 5, name: "Eve Evans" },
]

type SearchUserProps = {}

const SearchUser: React.FC<SearchUserProps> = () => {
  const [query, setQuery] = useState("")
  const [filteredProfiles, setFilteredProfiles] = useState(profiles)

  // Handle input change and filter profiles based on input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (value) {
      const matches = profiles.filter((profile) =>
        profile.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredProfiles(matches)
    } else {
      setFilteredProfiles(profiles)
    }
  }

  return (
    <div className="relative z-30 w-4/5">
      <Input
        type="text"
        placeholder="Search user..."
        value={query}
        onChange={handleInputChange}
        onBlur={() => setQuery("")}
        className="w-full focus-visible:ring-0"
      />

      {query && filteredProfiles.length > 0 && (
        <ul className="absolute w-full mt-2 bg-secondary rounded shadow-lg max-h-[75vh] overflow-y-auto scrollbar scrollbar-thumb-destructive scrollbar-track-transparent border border-destructive">
          {filteredProfiles.map((profile) => (
            <li
              key={profile.id}
              className="px-4 py-2 cursor-pointer hover:bg-card"
            >
              {profile.name}
            </li>
          ))}
        </ul>
      )}

      {query && filteredProfiles.length === 0 && (
        <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded shadow-lg px-4 py-2 text-gray-500">
          No matches found
        </div>
      )}
    </div>
  )
}
export default SearchUser
