import React from "react";
import { api } from "../api/axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "../components/index.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {login} from "../store/authSlice.js"

function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const onSubmit = async (data) => {
    try {
      const response = await api.post("/users/login", {
        email: data.email,
        password: data.password,
      });

     
 
      if (response.data.success) {
        dispatch(login(response.data.data.user));
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error(error.response.data);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" type="email" {...register("email", {required: true})} />
        <Input label="Password" type="password" {...register("password", {required: true})} />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}

export default Login;
