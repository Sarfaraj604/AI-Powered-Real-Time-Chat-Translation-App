import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../redux_toolkit/slices/authSlice";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageCircleMore, User } from "lucide-react";
import { toast } from "react-hot-toast";

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  
  const { loading } = useSelector((state) => state.auth);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid === true) await dispatch(signupUser(formData));
    
  };

  return (
    <div className="h-screen w-full flex items-center justify-center custom-input-bg px-4">
      <div className="bg-white/50 backdrop-blur-lg rounded-3xl w-full max-w-5xl h-[80vh] flex overflow-hidden">
        {/* Left - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10">
          <div className="w-full max-w-sm space-y-6">
            <div className="mb-4 flex flex-col items-center">
              <MessageCircleMore className="custom-input-text-l custom-input-text-d size-10"/>
              <h2 className="text-2xl lg:text-4xl font-bold text-zinc-800 mt-2">Create Account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm custom-input-text-l custom-input-text-d font-medium mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full input input-sm lg:input-md input-bordered rounded-md pl-10"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm custom-input-text-l custom-input-text-d font-medium mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="username@gmail.com"
                    className="w-full input input-sm lg:input-md rounded-md input-bordered pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm custom-input-text-l custom-input-text-d font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full input input-sm lg:input-md rounded-md input-bordered pr-10 pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="btn w-full custom-bg hover:custom-bg rounded-md text-white"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign up"}
              </button>
                          </form>

            <div className="text-center custom-input-text-d text-sm mt-4">
              Already have an account?{' '}
              <Link to="/login" className="custom-input-text-l custom-input-text-d hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </div>

        {/* Right - Image */}
        <div className="hidden md:flex w-1/2 items-center justify-center custom-bg">
          <img
            src="/loginpic.png"
            alt="Signup Illustration"
            className="w-3/4 max-w-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
