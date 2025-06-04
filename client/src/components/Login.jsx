import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Login = () => {
  const { setShowUserLogin, setUser } = useAppContext();
  const navigate = useNavigate();

  const [state, setState] = useState("login"); // 'login' or 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
  e.preventDefault();
  try {
    const { data } = await axios.post(
      `/api/user/${state}`,
      { name, email, password },
      { withCredentials: true }
    );

    if (data.success) {
      navigate('/');
      setUser(data.user);
      setShowUserLogin(false);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center justify-center text-sm text-gray-600 bg-black/50"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-4 items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium w-full text-center">
          <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <label>Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <label>Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <label>Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="password"
            required
          />
        </div>

        {state === "register" ? (
          <p>
            Already have an account?{' '}
            <span onClick={() => setState("login")} className="text-primary cursor-pointer">Click here</span>
          </p>
        ) : (
          <p>
            Create an account?{' '}
            <span onClick={() => setState("register")} className="text-primary cursor-pointer">Click here</span>
          </p>
        )}

        <button
          type="submit"
          className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
