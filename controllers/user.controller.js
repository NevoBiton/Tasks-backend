const Task = require("../models/task.model");
const User = require("../models/user.model");
// const mongoose = require('mongoose');
// const { ObjectId } = require('mongoose').Types;



async function editTask(req, res) {
  const { taskId } = req.params;
  const { title, description, body, todoList, isPinned } = req.body;
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: req.userId },
      { title, description, body, todoList, isPinned },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      console.log(`tasks.controller, editTask. Task not found with id: ${taskId}`);
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    console.log(err);
    console.log(`
      tasks.controller, editTask. Error while updating task with id: ${taskId}`,
      err
    );
    if (err.name === "ValidationError") {
      console.log(`tasks.controller, editTask. ${err.message}`);
      res.status(400).json({ message: err.message });
    } else {
      console.log(`tasks.controller, editTask. ${err.message}`);
      res.status(500).json({ message: "Server error while updating task" });
    }
  }
}

async function addTask(req, res) {
  const { userId } = req; // user id recieved from verifyToken func
  try {
    // Create and save the new task
    const tempTask = new Task({ ...req.body, user: userId });
    await tempTask.save();// ID will be assigned here

    // Find the user and add the task ID to their tasks array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.tasks.push(tempTask._id);
    await user.save();

    res.status(201).json({ message: "Task added successfully", task: tempTask });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
}


async function addTask(req, res) {
  const { title, description, body, todoList} = req.body;

  try {
    const userId = req.userId;
    const newTask = new Task({
        title,
        description,
        body,
        todoList,
      user: userId, // Associate the userId with the task
    });
    const savedTask = await newTask.save();

    await User.findByIdAndUpdate(userId, {
      $push: { tasks: savedTask._id }
    });

    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error while adding task:", err);
    res.status(500).json({ message: "Server error while adding task" });
  }
}

async function deleteTask(req, res) {
  const { taskId } = req.params;
  const userId = req.userId;

  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      user: userId,
    });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { tasks: deletedTask._id }
    });

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error while deleting task:", err);
    res.status(500).json({ message: "Server error while deleting task" });
  }
}

async function getUserTasks(req, res) {
    const userId = req.userId;
    // const page = query.page || 1;
    // const limit = query.limit || 6;
    // const pageIndex = (page - 1) * limit || 0

    try {
        const productsParams = { user: userId };  // Assuming 'owner' field holds user ID

        const totalProducts = await Task.countDocuments(productsParams);
        const products = await Task.find(productsParams)

        res.status(200).json({ total: totalProducts, products });
    } catch (err) {
        console.error("Error fetching user products:", err);
        res.status(500).json({ message: "Server error while fetching products" });
    }
}


module.exports = {
   addTask,
  deleteTask,
  getUserTasks,
  editTask
};