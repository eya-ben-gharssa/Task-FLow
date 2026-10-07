"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Task = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  userId: number;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  

  // Restore the saved token when the page loads (when refreshing page)
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch tasks when the user is logged in
  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setLoading(true);
  setMessage("");

  const endpoint = isRegistering ? "register" : "login";

  const body = isRegistering
    ? { name, email, password }
    : { email, password };

  try {
    const response = await fetch(
      `${API_URL}/api/auth/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Authentication failed");
      return;
    }

    // Both registration and login return a JWT.
    localStorage.setItem("token", data.token);
    setToken(data.token);
  } catch {
    setMessage("Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
}
  async function loadTasks() {
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        setMessage("Failed to load tasks.");
        return;
      }

      const data = await response.json();
      setTasks(data);
    } catch {
      setMessage("Unable to load tasks.");
    }
  }

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newTitle.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create task.");
        return;
      }

      setTasks((prev) => [...prev, data]);
      setNewTitle("");
      setMessage("");
    } catch {
      setMessage("Unable to create task.");
    }
  }

  async function toggleTask(task: Task) {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update task.");
        return;
      }

      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? data : item))
      );
      setMessage("");
    } catch {
      setMessage("Unable to update task.");
    }
  }

  async function deleteTask(id: number) {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.message || "Failed to delete task.");
        return;
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
      setMessage("");
    } catch {
      setMessage("Unable to delete task.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
    setMessage("");
  }

  // Login screen
  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
            TaskFlow
          </h1>

          <p className="mb-8 text-center text-gray-500">
            {isRegistering
              ? "Create an account to get started"
              : "Sign in to manage your tasks"}
          </p>

          <form onSubmit={handleLogin}
           className="space-y-5">
            {isRegistering && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              )}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500 "
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500 "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isRegistering
                  ? "Sign Up"
                  : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setMessage("");
                setName("");
                setPassword("");
              }}
              className="ml-2 font-medium text-blue-600 hover:underline"
            >
              {isRegistering ? "Sign In" : "Sign Up"}
            </button>
          </p>

          {message && (
            <p className="mt-5 text-center text-sm text-red-600">
              {message}
            </p>
          )}
        </div>
      </main>
    );
  }

  // Dashboard
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TaskFlow</h1>
            <p className="mt-1 text-gray-500">Your personal task manager</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            My Tasks
          </h2>

          <form onSubmit={createTask} className="mb-6 flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-gray-500"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Add
            </button>
          </form>

          {message && (
            <p className="mb-4 text-sm text-red-600">{message}</p>
          )}

          {tasks.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No tasks yet. Add your first task!
            </p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-4"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                    className="h-5 w-5 cursor-pointer accent-blue-600"
                  />

                  <span
                    className={`flex-1 break-words ${
                      task.completed
                        ? "text-gray-400 line-through"
                        : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-sm text-gray-500">
            {tasks.filter((task) => task.completed).length} of {tasks.length}{" "}
            tasks completed
          </p>
        </section>
      </div>
    </main>
  );
}