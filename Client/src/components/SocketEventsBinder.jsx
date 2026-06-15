import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../lib/socket";              
import { updateUserInList } from "../redux_toolkit/slices/userSlice";
import { profilePicPatched } from "../redux_toolkit/slices/authSlice";

const SocketEventsBinder = () => {
  const dispatch   = useDispatch();
  const myId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    socket.on("profileUpdated", ({ userId, profilePic }) => {
          console.log("profileUpdated arrived", { userId, profilePic });

      dispatch(updateUserInList({ _id: userId, profilePic }));

      if (userId === myId) dispatch(profilePicPatched(profilePic));
    });

    return () => socket.off("profileUpdated");
  }, [dispatch, myId]);
  return null;          
};

export default SocketEventsBinder;