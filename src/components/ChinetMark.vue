<template>
  <svg
    class="chinet-mark"
    :viewBox="MARK_VIEWBOX"
    :width="width"
    :height="height"
    :style="{ height: height + 'px', width: 'auto' }"
    fill="currentColor"
    role="img"
    aria-label="ChiNet"
  >
    <path :d="MARK_PATH" />
  </svg>
</template>

<script setup>
import { computed } from "vue";
import { MARK_ASPECT, MARK_PATH, MARK_VIEWBOX } from "../chinet-mark";

/**
 * The mark is 1.41:1, so it is sized by height and the width follows.
 * Height is applied inline on purpose: a scoped class here and a class on the
 * consuming element have the same specificity, and whichever the bundler emits
 * last would win - which made the mark fill its container in dev builds.
 */
const props = defineProps({
  height: { type: Number, default: 38 },
});

const width = computed(() => Math.round(props.height * MARK_ASPECT));
</script>

<style scoped>
.chinet-mark {
  display: block;
}
</style>
