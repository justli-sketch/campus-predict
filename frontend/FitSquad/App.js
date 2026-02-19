import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Modal, ActivityIndicator,
  Alert, StatusBar, Dimensions
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://emihydqnichsfknuuxds.supabase.co";
const SUPABASE_KEY = "sb_publishable_cP8_EGA_0FcB19BHYXItXg_i1T5nb0E";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }
});

const { width } = Dimensions.get("window");

const FOOD_DB = [
  { name: "Oatmeal", cal: 150, icon: "🥣" },
  { name: "Banana", cal: 90, icon: "🍌" },
  { name: "Chicken Breast", cal: 165, icon: "🍗" },
  { name: "Greek Yogurt", cal: 100, icon: "🫙" },
  { name: "Protein Shake", cal: 130, icon: "🥤" },
  { name: "Brown Rice", cal: 215, icon: "🍚" },
  { name: "Salad", cal: 80, icon: "🥗" },
  { name: "Eggs (2)", cal: 140, icon: "🍳" },
  { name: "Almonds", cal: 160, icon: "🌰" },
  { name: "Pizza Slice", cal: 285, icon: "🍕" },
  { name: "Avocado Toast", cal: 250, icon: "🥑" },
  { name: "Coffee w/ Milk", cal: 50, icon: "☕" },
];

const EXERCISES = [
  { name: "Bench Press", muscle: "Chest", icon: "🏋️" },
  { name: "Squats", muscle: "Legs", icon: "🦵" },
  { name: "Pull-ups", muscle: "Back", icon: "💪" },
  { name: "Deadlift", muscle: "Full Body", icon: "⚡" },
  { name: "Running", muscle: "Cardio", icon: "🏃" },
  { name: "Plank", muscle: "Core", icon: "🧘" },
];

const AVATARS = ["⚡", "🏃", "💪", "🧘", "🔥", "🦅", "🐺", "🦁"];
const FRIEND_COLORS = ["#00c896", "#a855f7", "#3b82f6", "#f59e0b"];

function today() { return new Date().toISOString().split("T")[0]; }

// ── Progress Ring ──
function Ring({ value, max, size = 110, stroke = 10, color = "#ff6b35", label, sub }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / Math.max(max, 1), 1);
  const offset = circ - pct * circ;
  const cx = size / 2, cy = size / 2;
  // Simple SVG-like using View with border trick
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: "rgba(255,255,255,0.1)",
        position: "absolute"
      }} />
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke,
        borderColor: color,
        borderTopColor: pct < 0.25 ? "rgba(255,255,255,0.1)" : color,
        borderRightColor: pct < 0.5 ? "rgba(255,255,255,0.1)" : color,
        borderBottomColor: pct < 0.75 ? "rgba(255,255,255,0.1)" : color,
        position: "absolute",
        transform: [{ rotate: "-90deg" }]
      }} />
      <Text style={{ color: "#fff", fontSize: size * 0.18, fontWeight: "800" }}>{label}</Text>
      {sub && <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: size * 0.11, marginTop: 1 }}>{sub}</Text>}
    </View>
  );
}

// ── Toast ──
function Toast({ message }) {
  return (
    <View style={{ position: "absolute", bottom: 100, alignSelf: "center", backgroundColor: "#ff6b35", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 100, zIndex: 999 }}>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{message}</Text>
    </View>
  );
}

// ── Auth Screen ──
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("2000");
  const [avatar, setAvatar] = useState("⚡");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log("data:", JSON.stringify(data));
      console.log("error:", JSON.stringify(error));
      if (error) throw error;
      alert("Success! User: " + data.user?.id);
    } catch (e) { 
      setError(e.message);
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 38, fontWeight: "900", color: "#ff6b35", marginBottom: 4 }}>FitSquad⚡</Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 40 }}>compete. crush. repeat.</Text>

        <View style={{ width: "100%", maxWidth: 380, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 24 }}>
          {/* Toggle */}
          <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4, marginBottom: 22 }}>
            {["login", "signup"].map(m => (
              <TouchableOpacity key={m} onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: mode === m ? "#ff6b35" : "transparent", alignItems: "center" }}>
                <Text style={{ color: mode === m ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: "700", fontSize: 13 }}>{m === "login" ? "LOG IN" : "SIGN UP"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={s.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry />

          {mode === "signup" && (
            <>
              <TextInput style={s.input} placeholder="Username" placeholderTextColor="rgba(255,255,255,0.3)" value={username} onChangeText={setUsername} autoCapitalize="none" />
              <TextInput style={s.input} placeholder="Daily calorie goal (e.g. 2000)" placeholderTextColor="rgba(255,255,255,0.3)" value={goal} onChangeText={setGoal} keyboardType="numeric" />
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 10 }}>PICK YOUR AVATAR</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {AVATARS.map(a => (
                  <TouchableOpacity key={a} onPress={() => setAvatar(a)} style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: avatar === a ? "#ff6b35" : "rgba(255,255,255,0.1)", backgroundColor: avatar === a ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.04)", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 22 }}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {!!error && <View style={{ backgroundColor: "rgba(255,68,68,0.12)", borderRadius: 8, padding: 10, marginBottom: 12 }}><Text style={{ color: "#ff4444", fontSize: 12 }}>{error}</Text></View>}

          <TouchableOpacity onPress={submit} disabled={loading} style={{ backgroundColor: loading ? "rgba(255,107,53,0.5)" : "#ff6b35", borderRadius: 14, padding: 16, alignItems: "center" }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{mode === "login" ? "LET'S GO →" : "CREATE ACCOUNT →"}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Main App ──
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [meals, setMeals] = useState([]);
  const [steps, setSteps] = useState(0);
  const [gymSession, setGymSession] = useState(null);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [friends, setFriends] = useState([]);
  const [toast, setToast] = useState(null);
  const [showFood, setShowFood] = useState(false);
  const [showWorkout, setShowWorkout] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendResults, setFriendResults] = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadAll(session.user.id);
      else setLoading(false);
    });
    supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) loadAll(session.user.id);
      else { setLoading(false); setProfile(null); }
    });
  }, []);

  const loadAll = async (uid) => {
    const [profRes, mealsRes, stepsRes, gymRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase.from("meals").select("*").eq("user_id", uid).gte("eaten_at", today() + "T00:00:00").order("eaten_at"),
      supabase.from("steps").select("*").eq("user_id", uid).eq("logged_at", today()).single(),
      supabase.from("gym_sessions").select("*").eq("user_id", uid).eq("logged_at", today()).single(),
    ]);
    if (profRes.data) setProfile(profRes.data);
    if (mealsRes.data) setMeals(mealsRes.data);
    if (stepsRes.data) setSteps(stepsRes.data.count);
    if (gymRes.data) { setGymSession(gymRes.data); setWorkoutExercises(gymRes.data.exercises || []); }
    setLoading(false);
    loadFriends(uid);
  };

  const loadFriends = async (uid) => {
    const { data: fs } = await supabase
      .from("friendships")
      .select("*, friend:profiles!friendships_friend_id_fkey(*), user:profiles!friendships_user_id_fkey(*)")
      .or(`user_id.eq.${uid},friend_id.eq.${uid}`)
      .eq("status", "accepted");
    if (!fs) return;
    const profiles = fs.map(f => f.user_id === uid ? f.friend : f.user);
    const enriched = await Promise.all(profiles.map(async fp => {
      const [m, st, g] = await Promise.all([
        supabase.from("meals").select("calories").eq("user_id", fp.id).gte("eaten_at", today() + "T00:00:00"),
        supabase.from("steps").select("count").eq("user_id", fp.id).eq("logged_at", today()).single(),
        supabase.from("gym_sessions").select("completed").eq("user_id", fp.id).eq("logged_at", today()).single(),
      ]);
      return { ...fp, calories: (m.data || []).reduce((s, x) => s + x.calories, 0), steps: st.data?.count || 0, gymDone: g.data?.completed || false };
    }));
    setFriends(enriched);
  };

  const addMeal = async (food) => {
    const { data } = await supabase.from("meals").insert({ user_id: session.user.id, name: food.name, calories: food.cal, icon: food.icon }).select().single();
    if (data) setMeals(p => [...p, data]);
    setShowFood(false);
    showToast(`+${food.cal} cal — ${food.name} logged! 🔥`);
  };

  const addSteps = async (n) => {
    const newCount = steps + n;
    setSteps(newCount);
    const { data: ex } = await supabase.from("steps").select("id").eq("user_id", session.user.id).eq("logged_at", today()).single();
    if (ex) await supabase.from("steps").update({ count: newCount }).eq("id", ex.id);
    else await supabase.from("steps").insert({ user_id: session.user.id, count: newCount, logged_at: today() });
    showToast(`+${n.toLocaleString()} steps! 🚶`);
  };

  const addExercise = async (ex) => {
    const updated = [...workoutExercises, { ...ex, sets: 3, reps: 10, weight: 45, id: Date.now() }];
    setWorkoutExercises(updated);
    if (gymSession) {
      await supabase.from("gym_sessions").update({ exercises: updated }).eq("id", gymSession.id);
    } else {
      const { data } = await supabase.from("gym_sessions").insert({ user_id: session.user.id, exercises: updated, logged_at: today() }).select().single();
      setGymSession(data);
    }
    setShowWorkout(false);
    showToast(`${ex.name} logged! 💪`);
  };

  const finishGym = async () => {
    if (gymSession) {
      await supabase.from("gym_sessions").update({ completed: true }).eq("id", gymSession.id);
      setGymSession(p => ({ ...p, completed: true }));
    }
    addSteps(800);
    showToast("Gym complete! Beast mode 🏆");
  };

  const searchFriends = async (q) => {
    if (q.length < 2) { setFriendResults([]); return; }
    const { data } = await supabase.from("profiles").select("*").ilike("username", `%${q}%`).neq("id", session.user.id).limit(8);
    setFriendResults(data || []);
  };

  const addFriend = async (fid) => {
    await supabase.from("friendships").insert({ user_id: session.user.id, friend_id: fid, status: "accepted" });
    showToast("Friend added! 🎉");
    setShowAddFriend(false);
    loadFriends(session.user.id);
  };

  const sendNudge = async (fid, fname) => {
    await supabase.from("nudges").insert({ from_id: session.user.id, to_id: fid });
    showToast(`Nudge sent to ${fname}! 👋`);
  };

  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const goal = profile?.calorie_goal || 2000;
  const burned = Math.round(steps * 0.04);
  const net = totalCal - burned;
  const hour = new Date().getHours();
  const dynamicGoal = Math.round(goal * Math.min((hour + 1) / 24, 1));
  const gymDone = gymSession?.completed || false;

  const leaderboard = [
    { name: "You", avatar: profile?.avatar || "⚡", calories: totalCal, goal, steps, streak: profile?.streak || 0, gymDone, color: "#ff6b35" },
    ...friends.map((f, i) => ({ name: f.username, avatar: f.avatar, calories: f.calories, goal: f.calorie_goal || 2000, steps: f.steps, streak: f.streak || 0, gymDone: f.gymDone, color: FRIEND_COLORS[i % 4] }))
  ].sort((a, b) => (b.calories / b.goal) - (a.calories / a.goal));

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0f", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 32, fontWeight: "900", color: "#ff6b35" }}>FitSquad⚡</Text>
    </View>
  );

  if (!session) return <AuthScreen onAuth={() => {}} />;

  const TABS = [
    { id: "dashboard", icon: "⚡", label: "Home" },
    { id: "calories", icon: "🔥", label: "Calories" },
    { id: "gym", icon: "🏋️", label: "Gym" },
    { id: "social", icon: "👥", label: "Squad" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, marginBottom: 2 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase()}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff" }}>
            Hey, <Text style={{ color: "#ff6b35" }}>{profile?.username || "Champ"}</Text> {profile?.avatar || "⚡"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>STREAK</Text>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#ff6b35" }}>{profile?.streak || 0}🔥</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <View style={{ gap: 14 }}>
            {/* Calorie card */}
            <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 20, backgroundColor: "rgba(255,107,53,0.08)" }]}>
              <Ring value={totalCal} max={goal} size={120} color="#ff6b35" label={totalCal} sub="kcal" />
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>TODAY'S CALORIES</Text>
                {[["Goal", goal, "rgba(255,255,255,0.4)"], ["Remaining", Math.max(goal - totalCal, 0), "#ff6b35"], ["Burned", burned, "#00c896"], ["Net", net, net > goal ? "#ff4444" : "#a855f7"]].map(([l, v, c]) => (
                  <View key={l} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                    <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{l}</Text>
                    <Text style={{ color: c, fontWeight: "700", fontSize: 12 }}>{v} kcal</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Pacing */}
            <View style={s.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={s.cardTitle}>PACING BY {hour + 1}:00</Text>
                <Text style={{ color: totalCal >= dynamicGoal ? "#00c896" : "#ff6b35", fontSize: 12, fontWeight: "700" }}>
                  {totalCal >= dynamicGoal ? "✓ On Track" : `${dynamicGoal - totalCal} behind`}
                </Text>
              </View>
              <View style={{ height: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
                <View style={{ width: `${Math.min((totalCal / Math.max(dynamicGoal, 1)) * 100, 100)}%`, height: "100%", backgroundColor: totalCal >= dynamicGoal ? "#00c896" : "#ff6b35", borderRadius: 100 }} />
              </View>
            </View>

            {/* Steps + Gym */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={[s.card, { flex: 1, alignItems: "center" }]}>
                <Ring value={steps} max={10000} size={88} color="#00c896" label={steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps} sub="steps" />
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginVertical: 6 }}>{Math.round((steps / 10000) * 100)}% of 10K</Text>
                <TouchableOpacity onPress={() => addSteps(1000)} style={[s.btnGhost, { width: "100%" }]}>
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", textAlign: "center" }}>+1K Steps</Text>
                </TouchableOpacity>
              </View>
              <View style={[s.card, { flex: 1, alignItems: "center", justifyContent: "center" }]}>
                <Text style={{ fontSize: 36, marginBottom: 6 }}>{gymDone ? "✅" : "🏋️"}</Text>
                <Text style={s.cardTitle}>GYM</Text>
                <Text style={{ color: gymDone ? "#00c896" : "rgba(255,255,255,0.35)", fontSize: 11, marginVertical: 6 }}>{gymDone ? "Crushed it!" : "Not logged"}</Text>
                <TouchableOpacity onPress={() => setTab("gym")} style={{ backgroundColor: gymDone ? "#00c896" : "#ff6b35", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 11 }}>{gymDone ? "View Log" : "Log Gym"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Squad preview */}
            {friends.length > 0 ? (
              <View style={s.card}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <Text style={s.cardTitle}>SQUAD ACTIVITY</Text>
                  <TouchableOpacity onPress={() => setTab("social")}><Text style={{ color: "#ff6b35", fontSize: 12, fontWeight: "700" }}>All →</Text></TouchableOpacity>
                </View>
                {friends.slice(0, 2).map((f, i) => {
                  const c = FRIEND_COLORS[i % 4];
                  return (
                    <View key={f.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c + "22", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: c + "55" }}>
                        <Text style={{ fontSize: 18 }}>{f.avatar}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{f.username}</Text>
                        <View style={{ height: 5, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden", marginTop: 5 }}>
                          <View style={{ width: `${Math.min((f.calories / (f.calorie_goal || 2000)) * 100, 100)}%`, height: "100%", backgroundColor: c, borderRadius: 100 }} />
                        </View>
                      </View>
                      <Text style={{ color: c, fontWeight: "700", fontSize: 12 }}>{f.calories}/{f.calorie_goal || 2000}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={[s.card, { alignItems: "center", paddingVertical: 28 }]}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>👥</Text>
                <Text style={[s.cardTitle, { marginBottom: 6 }]}>ADD YOUR SQUAD</Text>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 16, textAlign: "center" }}>Compete with friends to stay on track</Text>
                <TouchableOpacity onPress={() => { setTab("social"); setShowAddFriend(true); }} style={s.btn}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Find Friends</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => supabase.auth.signOut()} style={s.btnGhost}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontWeight: "700", fontSize: 12, textAlign: "center" }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CALORIES */}
        {tab === "calories" && (
          <View style={{ gap: 14 }}>
            <View style={[s.card, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,107,53,0.08)" }]}>
              <View>
                <Text style={{ fontSize: 36, fontWeight: "900", color: "#ff6b35" }}>{totalCal}</Text>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>of {goal} kcal goal</Text>
              </View>
              <Ring value={totalCal} max={goal} size={88} color="#ff6b35" label={`${Math.round((totalCal / goal) * 100)}%`} />
            </View>

            <View style={s.card}>
              <Text style={[s.cardTitle, { marginBottom: 14 }]}>MACRO ESTIMATE</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                {[["Protein", Math.round(totalCal * 0.11), Math.round(goal * 0.11), "#ff6b35"], ["Carbs", Math.round(totalCal * 0.17), Math.round(goal * 0.17), "#a855f7"], ["Fat", Math.round(totalCal * 0.033), Math.round(goal * 0.033), "#00c896"]].map(([l, v, mx, c]) => (
                  <View key={l} style={{ alignItems: "center" }}>
                    <Ring value={v} max={mx} size={72} stroke={7} color={c} label={`${v}g`} />
                    <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 6 }}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <Text style={s.cardTitle}>MEAL LOG</Text>
              <TouchableOpacity onPress={() => setShowFood(true)} style={s.btn}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>+ Add Food</Text>
              </TouchableOpacity>
            </View>

            {meals.length === 0 && (
              <View style={{ alignItems: "center", padding: 30 }}>
                <Text style={{ fontSize: 36, marginBottom: 10 }}>🍽️</Text>
                <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Log your first meal!</Text>
              </View>
            )}

            {meals.map((m, i) => (
              <View key={m.id || i} style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 }]}>
                <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>{m.name}</Text>
                  <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{new Date(m.eaten_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                </View>
                <Text style={{ color: "#ff6b35", fontWeight: "700", fontSize: 14 }}>{m.calories} kcal</Text>
              </View>
            ))}
          </View>
        )}

        {/* GYM */}
        {tab === "gym" && (
          <View style={{ gap: 14 }}>
            <View style={[s.card, { backgroundColor: "rgba(168,85,247,0.08)" }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>TODAY'S WORKOUT</Text>
                  <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 }}>{workoutExercises.length} exercises</Text>
                </View>
                {gymDone
                  ? <View style={{ backgroundColor: "#00c89622", borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 }}><Text style={{ color: "#00c896", fontWeight: "700", fontSize: 12 }}>✓ DONE</Text></View>
                  : <TouchableOpacity onPress={finishGym} style={{ backgroundColor: "#a855f7", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}><Text style={{ color: "#fff", fontWeight: "700" }}>Finish 💪</Text></TouchableOpacity>
                }
              </View>
            </View>

            <TouchableOpacity onPress={() => setShowWorkout(true)} style={[s.btn, { paddingVertical: 16 }]}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, textAlign: "center" }}>+ Add Exercise</Text>
            </TouchableOpacity>

            {workoutExercises.length === 0 && (
              <View style={{ alignItems: "center", padding: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🏋️</Text>
                <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Add your first exercise!</Text>
              </View>
            )}

            {workoutExercises.map((ex, i) => (
              <View key={ex.id || i} style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14 }]}>
                <Text style={{ fontSize: 26 }}>{ex.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>{ex.name}</Text>
                  <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{ex.muscle}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {[["sets", ex.sets || 3], ["reps", ex.reps || 10], ["lb", ex.weight || 45]].map(([l, v]) => (
                    <View key={l} style={{ alignItems: "center" }}>
                      <Text style={{ color: "#a855f7", fontWeight: "700", fontSize: 15 }}>{v}</Text>
                      <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 9 }}>{l}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SOCIAL */}
        {tab === "social" && (
          <View style={{ gap: 14 }}>
            <View style={s.card}>
              <Text style={[s.cardTitle, { marginBottom: 16 }]}>🏆 LEADERBOARD</Text>
              {leaderboard.map((f, i) => (
                <View key={f.name} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12, padding: 10, borderRadius: 14, backgroundColor: f.name === "You" ? "rgba(255,107,53,0.08)" : "transparent", borderWidth: 1, borderColor: f.name === "You" ? "rgba(255,107,53,0.2)" : "transparent" }}>
                  <Text style={{ width: 20, fontSize: 15, fontWeight: "900", color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.25)" }}>{i + 1}</Text>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: f.color + "22", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: f.color + "66" }}>
                    <Text style={{ fontSize: 18 }}>{f.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{f.name}{f.name === "You" ? " (you)" : ""}</Text>
                    <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden", marginTop: 5 }}>
                      <View style={{ width: `${Math.min((f.calories / f.goal) * 100, 100)}%`, height: "100%", backgroundColor: f.color, borderRadius: 100 }} />
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: f.color, fontWeight: "700", fontSize: 12 }}>{Math.round((f.calories / f.goal) * 100)}%</Text>
                    <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{f.streak}🔥</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={() => setShowAddFriend(true)} style={[s.btn, { paddingVertical: 16 }]}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, textAlign: "center" }}>+ Add Friend</Text>
            </TouchableOpacity>

            {friends.map((f, i) => {
              const c = FRIEND_COLORS[i % 4];
              return (
                <View key={f.id} style={[s.card, { borderColor: c + "33", borderWidth: 1 }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c + "22", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: c }}>
                      <Text style={{ fontSize: 22 }}>{f.avatar}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "900" }}>{f.username}</Text>
                      <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                        {f.gymDone && <View style={{ backgroundColor: c + "22", borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={{ color: c, fontSize: 10, fontWeight: "700" }}>🏋️ Done</Text></View>}
                        <View style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{f.streak || 0}🔥</Text></View>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => sendNudge(f.id, f.username)} style={s.btnGhost}>
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>Nudge 👋</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {[["Calories", `${f.calories}/${f.calorie_goal || 2000}`, c], ["Steps", (f.steps || 0).toLocaleString(), "#00c896"], ["Goal %", `${Math.round((f.calories / (f.calorie_goal || 2000)) * 100)}%`, "#a855f7"]].map(([l, v, col]) => (
                      <View key={l} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 10, alignItems: "center" }}>
                        <Text style={{ color: col, fontWeight: "700", fontSize: 12 }}>{v}</Text>
                        <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 2 }}>{l}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={{ flexDirection: "row", backgroundColor: "rgba(10,10,15,0.98)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", paddingBottom: 24, paddingTop: 10 }}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={{ flex: 1, alignItems: "center", gap: 3 }}>
            <Text style={{ fontSize: 20 }}>{t.icon}</Text>
            <Text style={{ fontSize: 10, color: tab === t.id ? "#ff6b35" : "rgba(255,255,255,0.3)", fontWeight: tab === t.id ? "700" : "400" }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Food Modal */}
      <Modal visible={showFood} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>🍽️ LOG FOOD</Text>
              <TouchableOpacity onPress={() => setShowFood(false)}><Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {FOOD_DB.map(f => (
                <TouchableOpacity key={f.name} onPress={() => addMeal(f)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12 }}>
                  <Text style={{ fontSize: 26 }}>{f.icon}</Text>
                  <Text style={{ flex: 1, color: "#fff", fontSize: 13, fontWeight: "700" }}>{f.name}</Text>
                  <Text style={{ color: "#ff6b35", fontWeight: "700", fontSize: 14 }}>{f.cal} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Workout Modal */}
      <Modal visible={showWorkout} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>🏋️ ADD EXERCISE</Text>
              <TouchableOpacity onPress={() => setShowWorkout(false)}><Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {EXERCISES.map(ex => (
                <TouchableOpacity key={ex.name} onPress={() => addExercise(ex)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12 }}>
                  <Text style={{ fontSize: 26 }}>{ex.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>{ex.name}</Text>
                    <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{ex.muscle}</Text>
                  </View>
                  <View style={{ backgroundColor: "#a855f722", borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: "#a855f7", fontWeight: "700", fontSize: 11 }}>+ Add</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Friend Modal */}
      <Modal visible={showAddFriend} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>👥 FIND FRIENDS</Text>
              <TouchableOpacity onPress={() => { setShowAddFriend(false); setFriendResults([]); setFriendSearch(""); }}><Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>✕</Text></TouchableOpacity>
            </View>
            <TextInput style={s.input} placeholder="Search by username..." placeholderTextColor="rgba(255,255,255,0.3)" value={friendSearch} onChangeText={t => { setFriendSearch(t); searchFriends(t); }} autoCapitalize="none" />
            {friendResults.length === 0 && friendSearch.length >= 2 && (
              <Text style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 20, fontSize: 13 }}>No users found</Text>
            )}
            {friendResults.map(u => (
              <View key={u.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#ff6b3522", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 20 }}>{u.avatar}</Text>
                </View>
                <Text style={{ flex: 1, color: "#fff", fontSize: 13, fontWeight: "700" }}>{u.username}</Text>
                <TouchableOpacity onPress={() => addFriend(u.id)} style={s.btn}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Add</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {toast && <Toast message={toast} />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 20, padding: 18, marginBottom: 2 },
  cardTitle: { color: "#fff", fontSize: 13, fontWeight: "800", letterSpacing: 0.5, marginBottom: 4 },
  btn: { backgroundColor: "#ff6b35", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  input: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 12, color: "#fff", fontSize: 13, marginBottom: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#14141f", borderRadius: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: 24, maxHeight: "75%", },
});