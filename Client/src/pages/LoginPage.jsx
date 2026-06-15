import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux_toolkit/slices/authSlice";
import { Link } from "react-router-dom";
import { MessageCircleMore, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!formData.password) return toast.error("Password is required");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid === true) dispatch(loginUser(formData));
  };

  return (
    <div className="h-screen w-full flex items-center justify-center custom-input-bg px-4">
      <div className="bg-white/50 backdrop-blur-lg rounded-3xl w-full max-w-5xl h-[70vh] flex overflow-hidden">
        {/* Left - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-2 lg:p-10">
          <div className="w-full max-w-sm lg:space-y-6 space-x-4">
            <div className="mb-4 flex flex-col items-center">
              <MessageCircleMore className="custom-input-text-l custom-input-text-d size-10"/>
              <h2 className="text-4xl font-bold text-zinc-800 mt-2">Welcome Back</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm custom-input-text-l custom-input-text-d font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="username@gmail.com"
                  className="w-full input input-sm lg:input-md input-bordered rounded-md"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm custom-input-text custom-input-text-l custom-input-text-d font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full input input-sm lg:input-md input-bordered rounded-md pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
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
                <div className="text-right mt-1">
                  <button type="button" className="text-sm custom-input-text-l custom-input-text-d hover:underline">
                    Forgot Password?
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="btn w-full custom-bg hover:custom-bg rounded-md text-white"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign in"}
              </button>
              
            </form>

            <div className="text-center custom-input-text-d text-sm text-zinc-600">Or Continue With</div>

            <div className="flex justify-center gap-4">
              <button className="btn btn-sm btn-outline rounded-full">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              </button>
              <button className="btn btn-sm btn-outline rounded-full">
                <img src="/github.svg" alt="GitHub" className="w-8 h-8" />
              </button>
              <button className="btn btn-sm btn-outline rounded-full">
                <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center custom-input-text-d text-sm mt-4">
              Don’t have an account?{' '}
              <Link to="/signup" className="custom-input-text-l hover:underline">
                Create account
              </Link>
            </div>
          </div>
        </div>

        {/* Right - Image */}
        <div className="hidden md:flex w-1/2 items-center justify-center custom-bg">
          <img
            src="/loginpic.png"
            alt="Login Illustration"
            className="w-3/4 max-w-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
