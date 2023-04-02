<main class="bg-magnolia">
  <ToastContext>
    <Router
      basepath={import.meta.env.BASE_URL}
    >
      <SidebarContext>
        <Sidebar />
        <section class="content">
          <Routes />
        </section>
      </SidebarContext>
    </Router>
  </ToastContext>
</main>

<script lang="ts">
  import { onMount } from "svelte";
  import { Router } from "svelte-navigator";
  import Routes from "./routes/Routes.svelte";
  import SidebarContext from "./components/SidebarContext.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import ToastContext from "@/components/toast/ToastContext.svelte";
  import { loadJwtToken } from "./utils/jwt";
  import { loadUserData } from "./utils/user";

  onMount(() => {
    loadJwtToken();
    loadUserData();
  })
</script>

<style>
  main {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: 1fr;
      grid-template-columns: auto 1fr;
      grid-template-areas: "sidebar content";
  }

  .content {
      grid-area: content;
      width: 100%;
      height: 100%;
  }
</style>
