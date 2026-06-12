import React from "react";
import { api } from "../api/axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {Input, Button} from "../components/index.js";
import toast from "react-hot-toast";



function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();


  const onSubmit = async (data) => {
    try {
      console.log(data);
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("avatar", data.avatar[0]);
      formData.append("coverImage", data.coverImage[0]);
      
      // Send the form data to the backend
      const response = await api.post("/users/register", formData);
      
      if(response.data.success) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      console.error(error.response.data);

      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
       <Input label="Full Name" {...register("fullName", {required: true})} />
        <Input label="Username" {...register("username", {required: true})} />
        <Input label="Email" type="email" {...register("email", {required: true})} />
        <Input label="Password" type="password" {...register("password", {required: true})} />
        <Input label="Avatar" type="file" {...register("avatar", {required: true})} />
        <Input label="Cover Image" type="file" {...register("coverImage", {required: true})} />
        <Button type="submit">Register</Button>
      </form>
    </div>
  );
}

export default Register;
