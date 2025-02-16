<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardPanelContent>
        <!-- <ULandingHero
          title="برنامج ارشيفي لادارة الملفات"
          description="ما عليك الا البحث عن اي معلومة تريد وستري المقترحات المتعلقة بالبحث"
          :ui="{
            wrapper: 'py-16 sm:py-24 md:py-24',
            title: 'text-4xl sm:text-5xl font-tajawal',
            description: 'font-scheherazade',
          }"
        >
          <template #links>
            <UInput
              v-model="q"
              name="q"
              size="lg"
              placeholder="بحث..."
              icon="i-heroicons-magnifying-glass-20-solid"
              class="font-scheherazade w-5/12"
              autocomplete="off"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template #trailing>
                <UButton
                  v-show="q !== ''"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark-20-solid"
                  :padded="false"
                  @click="q = ''"
                />
              </template>
            </UInput>
          </template>
        </ULandingHero> -->

        <ULandingSection
          :title="features.title"
          :description="features.description"
          :ui="{
            wrapper: 'py-16 sm:py-24 md:py-24',
            title: 'text-4xl sm:text-5xl font-tajawal',
            description: 'font-scheherazade',
          }"
        >
          <!-- <template #links> -->
          <UInput
            v-model="q"
            name="q"
            size="lg"
            placeholder="بحث..."
            icon="i-heroicons-magnifying-glass-20-solid"
            class="mx-auto font-scheherazade w-5/12"
            autocomplete="off"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="q !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark-20-solid"
                :padded="false"
                @click="q = ''"
              />
            </template>
          </UInput>
          <!-- </template> -->

          <UPageGrid>
            <ULandingCard
              v-for="(item, index) in features.items"
              :key="index"
              :title="item.title"
              :description="item.description"
              :icon="item.icon"
            />
          </UPageGrid>
        </ULandingSection>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
const q = ref("");

interface Feature {
  title: string;
  description: string;
  icon: string;
}

const features = {
  title: "برنامج ارشيفي لادارة الملفات",
  description:
    "ما عليك الا البحث عن اي معلومة تريد وستري المقترحات المتعلقة بالبحث",
  items: [
    {
      title: "Easy to use",
      description:
        "Id laborum laboris duis nostrud excepteur ut velit nulla magna Lorem proident non.",
      icon: "i-heroicons-cog",
    },
    {
      title: "Reliable",
      description:
        "Magna Lorem ex cillum fugiat ad enim aute irure sit duis minim.",
      icon: "i-heroicons-check",
    },
    {
      title: "Secure",
      description:
        "Proident nostrud excepteur sint ut culpa consectetur aute adipisicing non anim ullamco.",
      icon: "i-heroicons-lock-closed",
    },
    {
      title: "Fast",
      description:
        "Qui reprehenderit nostrud dolore nisi ad fugiat labore eiusmod sint aliquip nisi voluptate.",
      icon: "i-heroicons-rocket-launch",
    },
    {
      title: "Affordable",
      description: "Reprehenderit fugiat elit in do ipsum ut pariatur.",
      icon: "i-heroicons-currency-dollar",
    },
    {
      title: "Scalable",
      description:
        "Lorem deserunt et eiusmod. Ea in consectetur minim officia ullamco enim deserunt est.",
      icon: "i-heroicons-chart-bar",
    },
  ],
};
</script>
