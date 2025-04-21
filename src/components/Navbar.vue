<template>
  <nav>
    <router-link to="/" class="nav-link">首页</router-link>
    <router-link to="/about" class="nav-link">关于</router-link>
    <router-link to="/contact" class="nav-link">联系我们</router-link>
  </nav>
</template>

<script setup>
// 使用 setup 语法糖，这里不需要额外的逻辑
</script>

<style scoped>
.nav-link {
  margin: 0 10px;
  text-decoration: none;
}

.router-link-active {
  color: #42b983;
}
</style>
