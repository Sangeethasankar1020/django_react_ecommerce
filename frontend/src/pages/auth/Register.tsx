import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { AppDispatch, RootState } from "../../store/store";
import {
  register as registerUser,
  clearError,
} from "../../store/slices/authSlice";
import { RegisterData } from "../../types/auth";
import { toast } from "react-toastify";

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<RegisterData>();

  const watchPassword = watch("password");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      if (typeof error === "string") {
        toast.error(error);
      } else {
        Object.values(error).forEach((messages) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          }
        });
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data: RegisterData) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success("Registration successful! Please login to continue.");
      navigate("/login");
    } catch (error) {
      // Error is handled by the useEffect above
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <UserPlus className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="sr-only">
                  First Name
                </label>
                <input
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                  type="text"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="First name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="sr-only">
                  Last Name
                </label>
                <input
                  {...register("last_name", {
                    required: "Last name is required",
                  })}
                  type="text"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                type={showPassword ? "text" : "password"}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password_confirm" className="sr-only">
                Confirm Password
              </label>
              <input
                {...register("password_confirm", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watchPassword || "Passwords do not match",
                })}
                type={showConfirmPassword ? "text" : "password"}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password_confirm && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password_confirm.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                {...register("phone")}
                type="tel"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Phone number (optional)"
              />
            </div>

            <div>
              <label htmlFor="address" className="sr-only">
                Address
              </label>
              <textarea
                {...register("address")}
                rows={3}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Address (optional)"
              />
            </div>
          </div>
          <Controller
            name="role"
            control={control}
            defaultValue="customer"
            render={({ field: { onChange, value } }) => (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Register as merchant?
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(value === "admin" ? "customer" : "admin")
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    value === "admin" ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      value === "admin" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
          />
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
