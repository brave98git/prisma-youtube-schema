import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./index.css";

const API_URL = "http://localhost:3000/api";

type Gender = "MALE" | "FEMALE" | "OTHER";

type User = {
  id: string;
  username: string;
  gender: Gender;
  channelName: string;
  banner?: string | null;
  profilePicture?: string | null;
  subscriberCount: number;
  description?: string | null;
  uploads?: Upload[];
};

type Upload = {
  id: string;
  videoUrl: string;
  thumbnail: string;
  userId: string;
  createdAt: string;
  user?: Pick<User, "id" | "username" | "channelName" | "profilePicture">;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type AuthData = {
  user: User;
  token: string;
};

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

const emptyRegisterForm = {
  username: "",
  password: "",
  gender: "OTHER" as Gender,
  channelName: "",
  banner: "",
  profilePicture: "",
  description: "",
};

const emptyUploadForm = {
  videoUrl: "",
  thumbnail: "",
};

async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== ""),
  );
}

export function App() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [token, setToken] = useState(() => localStorage.getItem("youtube_token") ?? "");
  const [profile, setProfile] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [profileForm, setProfileForm] = useState({
    channelName: "",
    banner: "",
    profilePicture: "",
    description: "",
  });
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [message, setMessage] = useState("Connect your backend, then create a channel.");
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(token && profile);

  const profileInitials = useMemo(() => {
    const name = profile?.channelName || profile?.username || "YT";
    return name.slice(0, 2).toUpperCase();
  }, [profile]);

  async function refreshPublicData() {
    const [userResult, uploadResult] = await Promise.all([
      apiRequest<User[]>("/users"),
      apiRequest<Upload[]>("/uploads"),
    ]);

    setUsers(userResult.data ?? []);
    setUploads(uploadResult.data ?? []);
  }

  async function loadProfile(activeToken = token) {
    if (!activeToken) {
      return;
    }

    const result = await apiRequest<User>("/users/me", { token: activeToken });
    const user = result.data!;

    setProfile(user);
    setProfileForm({
      channelName: user.channelName ?? "",
      banner: user.banner ?? "",
      profilePicture: user.profilePicture ?? "",
      description: user.description ?? "",
    });
  }

  useEffect(() => {
    refreshPublicData().catch(error => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadProfile(token).catch(() => {
      localStorage.removeItem("youtube_token");
      setToken("");
      setProfile(null);
    });
  }, [token]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const path = mode === "register" ? "/auth/register" : "/auth/login";
      const payload = mode === "register" ? cleanPayload(registerForm) : loginForm;
      const result = await apiRequest<AuthData>(path, {
        method: "POST",
        body: payload,
      });

      localStorage.setItem("youtube_token", result.data!.token);
      setToken(result.data!.token);
      setProfile(result.data!.user);
      setMessage(result.message);
      await refreshPublicData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await apiRequest<User>("/users/me", {
        method: "PATCH",
        body: cleanPayload(profileForm),
        token,
      });

      setProfile(result.data!);
      setMessage(result.message);
      await refreshPublicData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await apiRequest<Upload>("/uploads", {
        method: "POST",
        body: uploadForm,
        token,
      });

      setUploadForm(emptyUploadForm);
      setMessage(result.message);
      await refreshPublicData();
      await loadProfile();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("youtube_token");
    setToken("");
    setProfile(null);
    setMessage("Signed out.");
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <span className="brand-mark">YT</span>
          <h1>Channel Studio</h1>
        </div>
        {isLoggedIn ? (
          <button className="ghost-button" onClick={logout} type="button">
            Sign out
          </button>
        ) : null}
      </section>

      <section className="status-row">
        <p>{message}</p>
        <span>{loading ? "Working..." : "Ready"}</span>
      </section>

      <div className="workspace-grid">
        <section className="panel auth-panel">
          <div className="panel-header">
            <h2>{mode === "register" ? "Create channel" : "Sign in"}</h2>
            <div className="segmented-control">
              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => setMode("register")}
                type="button"
              >
                Register
              </button>
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleAuth}>
            <label>
              Username
              <input
                value={mode === "register" ? registerForm.username : loginForm.username}
                onChange={event =>
                  mode === "register"
                    ? setRegisterForm({ ...registerForm, username: event.target.value })
                    : setLoginForm({ ...loginForm, username: event.target.value })
                }
                placeholder="creator01"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={mode === "register" ? registerForm.password : loginForm.password}
                onChange={event =>
                  mode === "register"
                    ? setRegisterForm({ ...registerForm, password: event.target.value })
                    : setLoginForm({ ...loginForm, password: event.target.value })
                }
                placeholder="minimum 6 characters"
                required
              />
            </label>

            {mode === "register" ? (
              <>
                <label>
                  Channel name
                  <input
                    value={registerForm.channelName}
                    onChange={event =>
                      setRegisterForm({ ...registerForm, channelName: event.target.value })
                    }
                    placeholder="Code Stream"
                    required
                  />
                </label>
                <label>
                  Gender
                  <select
                    value={registerForm.gender}
                    onChange={event =>
                      setRegisterForm({
                        ...registerForm,
                        gender: event.target.value as Gender,
                      })
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
                <label>
                  Profile image URL
                  <input
                    value={registerForm.profilePicture}
                    onChange={event =>
                      setRegisterForm({
                        ...registerForm,
                        profilePicture: event.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </label>
                <label>
                  Banner URL
                  <input
                    value={registerForm.banner}
                    onChange={event =>
                      setRegisterForm({ ...registerForm, banner: event.target.value })
                    }
                    placeholder="https://..."
                  />
                </label>
                <label className="wide-field">
                  Description
                  <textarea
                    value={registerForm.description}
                    onChange={event =>
                      setRegisterForm({
                        ...registerForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="What is your channel about?"
                  />
                </label>
              </>
            ) : null}

            <button className="primary-button wide-field" disabled={loading} type="submit">
              {mode === "register" ? "Create account" : "Login"}
            </button>
          </form>
        </section>

        <section className="panel profile-panel">
          <div className="channel-card">
            <div
              className="banner-preview"
              style={profile?.banner ? { backgroundImage: `url(${profile.banner})` } : undefined}
            />
            <div className="channel-body">
              <div className="avatar">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.channelName} />
                ) : (
                  profileInitials
                )}
              </div>
              <div>
                <h2>{profile?.channelName ?? "No channel selected"}</h2>
                <p>{profile?.description ?? "Register or sign in to manage your channel."}</p>
              </div>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleProfileUpdate}>
            <label>
              Channel name
              <input
                value={profileForm.channelName}
                onChange={event =>
                  setProfileForm({ ...profileForm, channelName: event.target.value })
                }
                disabled={!isLoggedIn}
              />
            </label>
            <label>
              Profile image URL
              <input
                value={profileForm.profilePicture}
                onChange={event =>
                  setProfileForm({
                    ...profileForm,
                    profilePicture: event.target.value,
                  })
                }
                disabled={!isLoggedIn}
              />
            </label>
            <label className="wide-field">
              Banner URL
              <input
                value={profileForm.banner}
                onChange={event =>
                  setProfileForm({ ...profileForm, banner: event.target.value })
                }
                disabled={!isLoggedIn}
              />
            </label>
            <label className="wide-field">
              Description
              <textarea
                value={profileForm.description}
                onChange={event =>
                  setProfileForm({ ...profileForm, description: event.target.value })
                }
                disabled={!isLoggedIn}
              />
            </label>
            <button className="primary-button wide-field" disabled={!isLoggedIn || loading} type="submit">
              Save profile
            </button>
          </form>
        </section>

        <section className="panel upload-panel">
          <div className="panel-header">
            <h2>New upload</h2>
          </div>
          <form className="form-grid single-column" onSubmit={handleCreateUpload}>
            <label>
              Video URL
              <input
                value={uploadForm.videoUrl}
                onChange={event =>
                  setUploadForm({ ...uploadForm, videoUrl: event.target.value })
                }
                placeholder="https://..."
                disabled={!isLoggedIn}
                required
              />
            </label>
            <label>
              Thumbnail URL
              <input
                value={uploadForm.thumbnail}
                onChange={event =>
                  setUploadForm({ ...uploadForm, thumbnail: event.target.value })
                }
                placeholder="https://..."
                disabled={!isLoggedIn}
                required
              />
            </label>
            <button className="primary-button" disabled={!isLoggedIn || loading} type="submit">
              Publish upload
            </button>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="panel-header">
            <h2>Uploads</h2>
            <button className="ghost-button" onClick={refreshPublicData} type="button">
              Refresh
            </button>
          </div>
          <div className="upload-list">
            {uploads.length ? (
              uploads.map(upload => (
                <article className="upload-card" key={upload.id}>
                  <img src={upload.thumbnail} alt="" />
                  <div>
                    <a href={upload.videoUrl} target="_blank" rel="noreferrer">
                      Watch video
                    </a>
                    <p>{upload.user?.channelName ?? "Unknown channel"}</p>
                    <span>{new Date(upload.createdAt).toLocaleDateString()}</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">No uploads yet.</p>
            )}
          </div>
        </section>

        <section className="panel list-panel">
          <div className="panel-header">
            <h2>Channels</h2>
          </div>
          <div className="user-list">
            {users.length ? (
              users.map(user => (
                <article className="user-row" key={user.id}>
                  <div className="mini-avatar">
                    {user.profilePicture ? <img src={user.profilePicture} alt="" /> : user.channelName.slice(0, 1)}
                  </div>
                  <div>
                    <strong>{user.channelName}</strong>
                    <span>@{user.username}</span>
                  </div>
                  <small>{user.subscriberCount} subs</small>
                </article>
              ))
            ) : (
              <p className="empty-state">No channels yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
