<main>
  <Router>
    <SidebarContext>
      <Sidebar />
      <section class="content">
        <Routes />
      </section>
    </SidebarContext>
  </Router>
</main>

<script lang="ts">
  import { Router } from "svelte-navigator";
  import Routes from "./routes/Routes.svelte";
  import SidebarContext from "./components/SidebarContext.svelte";
  import Sidebar from "./components/Sidebar.svelte";
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
