<script lang="ts">
  let count: number = 0
  const increment = () => {
    count += 1
  }
</script>

<div class="h-[80px] w-[320px] rounded-2xl bg-neutral-400">
  <div class="pl-[24px] pt-[8px]">
    <p class="text-xl">노래 제목 뭐시기 저시기 어</p>
    <div class="mt-[4px] flex items-center gap-1">
      <button class="rounded-none border-0 bg-inherit p-0">
        <img src="/src/assets/Polygon.svg" alt="재생 아이콘" />
      </button>

      <p>00:00</p>
      <input type="range" />
      <p>03:00</p>
    </div>
  </div>
</div>
