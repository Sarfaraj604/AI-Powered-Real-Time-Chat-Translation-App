import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, setSelectedUser } from '../redux_toolkit/slices/userSlice';
import { Users, Search } from 'lucide-react';
import debounce from 'lodash/debounce';

const skeletonContacts = Array(6).fill(null);

const Sidebar = () => {
  const dispatch = useDispatch();
  const { users, loading, selectedUser, onlineUsers } = useSelector((state) => state.users);
  

  

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debouncedSearchHandler = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearchHandler.cancel();
    };
  }, [debouncedSearchHandler]);

  useEffect(() => {
    debouncedSearchHandler(search);
  }, [search, debouncedSearchHandler]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const highlightMatch = (text) => {
    const index = text.toLowerCase().indexOf(debouncedSearch.toLowerCase());
    if (index === -1 || debouncedSearch === "") return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + debouncedSearch.length);
    const after = text.slice(index + debouncedSearch.length);

    return (
      <>
        {before}
        <span className="bg-yellow-300 dark:bg-yellow-600 text-black px-0.5 rounded-sm">
          {match}
        </span>
        {after}
      </>
    );
  };

  return (
    <aside className="h-full w-15 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className='mt-2 hidden lg:block'>
          <h1 className='text-xl font-bold'>Messages</h1>
        </div>

        {/* Search */}
        <div className="hidden lg:block relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input rounded-md input-sm w-full input-bordered pl-10 focus:pl-10 focus:outline-none focus:ring-2 focus:ring-base-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto w-full py-3">
        {loading ? (
          skeletonContacts.map((_, idx) => (
            <div key={idx} className="w-full p-3 flex items-center gap-3">
              <div className="relative mx-auto lg:mx-0">
                <div className="skeleton size-12 rounded-full" />
              </div>
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="skeleton h-4 w-32 mb-2" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          ))
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-sm text-gray-500 mt-6">
            No users found
          </p>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => dispatch(setSelectedUser(user))}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user?.profilePic || "/avatar.png"}
                  alt={user?.fullName}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">
                  {highlightMatch(user.fullName)}
                </div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
