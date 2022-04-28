<template>
  <div id="app">
    <WorkingInterface></WorkingInterface>
  </div>
</template>

<script>
import WorkingInterface from "./components/WorkingInterface.vue"

export default {
  name: 'App',
  components: {
    WorkingInterface
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  position: absolute
}
</style>
