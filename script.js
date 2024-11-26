const taskNameInput = document.getElementById("task-name");
const taskDateInput = document.getElementById("task-date");
const taskTimeInput = document.getElementById("task-time");
const taskPriorityInput = document.getElementById("task-priority");
const addTaskButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const taskFilter = document.getElementById("task-filter");
const taskSearch = document.getElementById("task-search");

let editingTaskIndex = null;

const getTasks = () => JSON.parse(localStorage.getItem("tasks")) || [];
const saveTasks = (tasks) => localStorage.setItem("tasks", JSON.stringify(tasks));

// Render tasks to the DOM
const renderTasks = (filter = "all", search = "") => {
  taskList.innerHTML = "";
  const tasks = getTasks();

  tasks
    .filter(task => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      if (filter === "overdue") return new Date(task.dueDate) < new Date() && !task.completed;
      if (filter === "urgent") return task.priority === "urgent";
      return true;
    })
    .filter(task => task.name.toLowerCase().includes(search.toLowerCase()))
    .forEach((task, index) => {
      const taskItem = document.createElement("li");
      taskItem.classList.add("task-item");
      if (task.completed) taskItem.classList.add("completed");
      if (new Date(task.dueDate) < new Date() && !task.completed) taskItem.classList.add("overdue");

      taskItem.innerHTML = `
        <span>${task.name} (${task.dueDate} - ${task.priority})</span>
        <div>
          <button class="edit-btn">Edit</button>
          <button class="complete-btn">${task.completed ? "Undo" : "Complete"}</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      // Edit button
      taskItem.querySelector(".edit-btn").addEventListener("click", () => {
        editingTaskIndex = index; // Set the task index for editing
        taskNameInput.value = task.name;
        taskDateInput.value = task.dueDate.split(" ")[0]; // Ambil hanya tanggal
        taskTimeInput.value = task.dueDate.split(" ")[1]; // Ambil hanya waktu
        taskPriorityInput.value = task.priority;
        addTaskButton.textContent = "Update Task"; // Change button to "Update"
      });

      // Complete button
      taskItem.querySelector(".complete-btn").addEventListener("click", () => {
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks(filter, search);
      });

      // Delete button
      taskItem.querySelector(".delete-btn").addEventListener("click", () => {
        tasks.splice(index, 1); // Hapus task
        saveTasks(tasks);
        renderTasks(filter, search);
      });

      taskList.appendChild(taskItem);
    });
};

// Add task or update existing task
addTaskButton.addEventListener("click", () => {
  const name = taskNameInput.value;
  const date = taskDateInput.value;
  const time = taskTimeInput.value;
  const priority = taskPriorityInput.value;

  if (!name || !date || !time) {
    alert("Please fill out all fields!");
    return;
  }

  const tasks = getTasks();

  if (editingTaskIndex !== null) {
    // Update existing task
    tasks[editingTaskIndex] = {
      name,
      dueDate: `${date} ${time}`,
      priority,
      completed: tasks[editingTaskIndex].completed, // Preserve the completed status
    };
    editingTaskIndex = null; // Reset edit mode
    addTaskButton.textContent = "Add Task"; // Reset button text
  } else {
    // Add new task
    tasks.push({
      name,
      dueDate: `${date} ${time}`,
      priority,
      completed: false,
    });
  }

  saveTasks(tasks);
  renderTasks();
  taskNameInput.value = "";
  taskDateInput.value = "";
  taskTimeInput.value = "";
  taskPriorityInput.value = "normal";
});

// Filters and search
taskFilter.addEventListener("change", () => renderTasks(taskFilter.value, taskSearch.value));
taskSearch.addEventListener("input", () => renderTasks(taskFilter.value, taskSearch.value));

// Initial render
renderTasks();
