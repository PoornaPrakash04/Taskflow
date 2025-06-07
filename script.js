document.addEventListener("DOMContentLoaded", () => { 
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const loginModal = document.getElementById("loginModal");
    const signupModal = document.getElementById("signupModal");
    const closeLogin = document.getElementById("closeLogin");
    const closeSignup = document.getElementById("closeSignup");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const taskForm = document.getElementById("taskForm");
    const todoColumn = document.getElementById("todo");
    const ongoingColumn = document.getElementById("ongoing");
    const doneColumn = document.getElementById("done");
    const taskDetailModal = document.getElementById("taskDetailModal");
    const closeTaskDetail = document.getElementById("closeTaskDetail");
    const taskDetailForm = document.getElementById("taskDetailForm");
    const deleteTaskBtn = document.getElementById("deleteTaskBtn");
    const detailTaskText = document.getElementById("detailTaskText");
    const detailDueDate = document.getElementById("detailDueDate");
    const detailTaskType = document.getElementById("detailTaskType");
    const detailPriority = document.getElementById("detailPriority");
    let draggedTask = null;
    let currentTask = null;
    loginBtn.addEventListener("click", () => (loginModal.style.display = "flex"));
    signupBtn.addEventListener("click", () => (signupModal.style.display = "flex"));
    closeLogin.addEventListener("click", () => (loginModal.style.display = "none"));
    closeSignup.addEventListener("click", () => (signupModal.style.display = "none"));
    closeTaskDetail.addEventListener("click", () => (taskDetailModal.style.display = "none"));
    window.addEventListener("click", (e) => {
      if (e.target === loginModal) loginModal.style.display = "none";
      if (e.target === signupModal) signupModal.style.display = "none";
      if (e.target === taskDetailModal) taskDetailModal.style.display = "none";
    });
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert(`Logged in as: ${loginForm.loginUsername.value}`);
      loginModal.style.display = "none";
      loginForm.reset();
    });
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pwd = signupForm.signupPassword.value;
      const cpwd = signupForm.signupConfirmPassword.value; 
      if (pwd !== cpwd) {
        alert("Passwords do not match!");
        return;
      }
      alert(`Signup successful for: ${signupForm.signupUsername.value}`);
      signupModal.style.display = "none";
      signupForm.reset();
    });
    function saveTasks() {
      const allTasks = [];
      document.querySelectorAll(".task").forEach(task => {
        allTasks.push({
          title: task.dataset.title,
          dueDate: task.dataset.dueDate,
          priority: task.dataset.priority,
          status: task.dataset.status
        });
      });
      localStorage.setItem("tasks", JSON.stringify(allTasks));
    }
    function addTaskToCalendar(title, date) {
      if (!date) return;
  
      const events = JSON.parse(localStorage.getItem("calendarTasks")) || [];
      if (!events.find(ev => ev.title === title && ev.start === date)) {
        events.push({
          title: title,
          start: date,
          allDay: true
        });
        localStorage.setItem("calendarTasks", JSON.stringify(events));
        calendar.addEvent({
          title: title,
          start: date,
          allDay: true
        });
      }
    }
    function removeTaskFromCalendar(title, date) {
      if (!date) return;
  
      let events = JSON.parse(localStorage.getItem("calendarTasks")) || [];
  
      events = events.filter(event => !(event.title === title && event.start === date));
  
      localStorage.setItem("calendarTasks", JSON.stringify(events));
      if (calendar) {
        const calendarEvents = calendar.getEvents();
        calendarEvents.forEach(ev => {
          if (ev.title === title && ev.startStr === date) {
            ev.remove();
          }
        });
      }
    }
    function loadTasks() {
      const tasksJSON = localStorage.getItem("tasks");
      if (!tasksJSON) return;
      const tasks = JSON.parse(tasksJSON);
      tasks.forEach(taskData => {
        const task = document.createElement("div");
        task.classList.add("task");
        task.setAttribute("draggable", "true");  
        task.dataset.title = taskData.title;
        task.dataset.dueDate = taskData.dueDate;
        task.dataset.priority = taskData.priority;
        task.dataset.status = taskData.status; 
        task.innerHTML = `
          <strong>${taskData.title}</strong><br>
          Due: ${taskData.dueDate || "No date"}<br>
          Priority: ${taskData.priority}
          <span class="delete" title="Delete task">&times;</span>
        `;
        addTaskListeners(task);
        getColumn(taskData.status).appendChild(task);
      });
    }
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("title").value.trim();
      const date = document.getElementById("date").value;
      const priority = document.getElementById("priority").value;
      const status = document.getElementById("status").value; 
      if (!title || !priority || !status) {
        alert("Please fill all required fields.");
        return;
      }
      const task = document.createElement("div");
      task.classList.add("task");
      task.setAttribute("draggable", "true");
      task.dataset.title = title;
      task.dataset.dueDate = date;
      task.dataset.priority = priority;
      task.dataset.status = status;
      task.innerHTML = `
        <strong>${title}</strong><br>
        Due: ${date || "No date"}<br>
        Priority: ${priority}
        <span class="delete" title="Delete task">&times;</span>
      `;
      addTaskListeners(task);
      getColumn(status).appendChild(task);
      addTaskToCalendar(title, date);
      taskForm.reset();
      saveTasks();
    });
    function addTaskListeners(task) {
      task.addEventListener("dragstart", () => {
        draggedTask = task;
        task.classList.add("dragging");
      });
      task.addEventListener("dragend", () => {
        draggedTask = null;
        task.classList.remove("dragging");
      });
      task.addEventListener("click", () => {
        currentTask = task;
        detailTaskText.value = task.dataset.title;
        detailDueDate.value = task.dataset.dueDate;
        detailTaskType.value = task.dataset.status;
        detailPriority.value = task.dataset.priority;
        taskDetailModal.style.display = "flex";
      });
      const deleteBtn = task.querySelector(".delete");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm("Delete this task?")) {
            removeTaskFromCalendar(task.dataset.title, task.dataset.dueDate);
            task.remove();
            saveTasks(); 
          }
        });
      }
    }
    [todoColumn, ongoingColumn, doneColumn].forEach((col) => {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        col.classList.add("drag-over");
      }); 
      col.addEventListener("dragleave", () => {
        col.classList.remove("drag-over");
      });
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!draggedTask) return;
        col.classList.remove("drag-over");
        draggedTask.dataset.status = col.id;
        col.appendChild(draggedTask);
        saveTasks(); 
      });
    });
taskDetailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentTask) return;
    removeTaskFromCalendar(currentTask.dataset.title, currentTask.dataset.dueDate);
    currentTask.dataset.title = detailTaskText.value.trim();
    currentTask.dataset.dueDate = detailDueDate.value;
    currentTask.dataset.priority = detailPriority.value;
    currentTask.dataset.status = detailTaskType.value;
    addTaskToCalendar(currentTask.dataset.title, currentTask.dataset.dueDate);
    currentTask.innerHTML = `
      <strong>${currentTask.dataset.title}</strong><br>
      Due: ${currentTask.dataset.dueDate || "No date"}<br>
      Priority: ${currentTask.dataset.priority}
      <span class="delete" title="Delete task">&times;</span>
    `;
    addTaskListeners(currentTask);
    getColumn(currentTask.dataset.status).appendChild(currentTask);
    taskDetailModal.style.display = "none";
    saveTasks();
  });
    deleteTaskBtn.addEventListener("click", () => {
      if (currentTask && confirm("Delete this task?")) {
        removeTaskFromCalendar(currentTask.dataset.title, currentTask.dataset.dueDate);
        currentTask.remove();
        taskDetailModal.style.display = "none";
        saveTasks(); 
      }
    });
    function getColumn(status) {
      switch (status) {
        case "todo": return todoColumn;
        case "ongoing": return ongoingColumn;
        case "done": return doneColumn;
      }
    }
    const calendarEl = document.getElementById("calendar");
    let calendar = null; 
    if (calendarEl) {
      const savedEvents = JSON.parse(localStorage.getItem("calendarTasks")) || [];
      calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        events: savedEvents
      });
     calendar.render();
    }
    loadTasks();
  });
  