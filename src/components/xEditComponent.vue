<script setup lang="ts">
import { type IMany, useStore } from '../stores/store';
import { Dialog } from 'quasar';
// import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const s = useStore();
const router = useRouter();

function ShowDialog() {
  s.OneGetAll().catch((e) => console.error(e)); // for q-selet data
  s.ManyGetById().catch((e) => console.error(e)); // Before show dialog set "store.many.document.id" field!!!
}

function HideDialog() {
  s.many.document = {} as IMany;
}

function Submit() {
  Dialog.create({
    title: 'Confirm',
    message: 'Would you like to save changes?',
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      s.ManyEditById().catch((e) => console.error(e));
      s.ManyGetAll().catch((e) => console.error(e));
      s.app.showEditDialog = false;
    })
    .onCancel(() => {
      s.app.showEditDialog = false;
      router.push('/').catch((e) => console.error(e));
    });
}

function Reset() {
  s.many.document = { ...s.many.documentOld };
}

function Close() {
  s.app.showEditDialog = false;
}
</script>

<template>
  <q-dialog v-model="s.app.showEditDialog" persistent @hide="HideDialog()" @show="ShowDialog()">
    <q-card class="q-pa-md" style="width: 60vw; min-width: 300px">
      <q-form @reset="Reset()" @submit="Submit()">
        <div class="row">
          <div v-if="s.many.document.id" class="col-12 q-gutter-md">
            <h5 class="text-center q-mt-sm q-mb-none">Edit advertisement</h5>
            <q-select
              id="categoryNameField"
              v-model="s.many.document.categoryId"
              clearable
              emit-value
              filled
              label="categoryNameField"
              map-options
              option-label="categoryNameField"
              option-value="id"
              :options="s.one.documents"
              :rules="[(v) => v != null || 'Please choose one!']"
            />
            <q-input
              id="titleField"
              v-model="s.many.document.titleField"
              filled
              label="titleField"
              :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
              type="text"
            />
            <q-input
              id="descField"
              v-model="s.many.document.descField"
              filled
              label="descField"
              :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
              type="textarea"
            />
            <q-input
              id="dateField"
              v-model="s.many.document.dateField"
              clearable
              filled
              label="dateField"
              :rules="[(v) => (v != null && v != '') || 'dateField - Choose!']"
              type="date"
            />
            <div class="row justify-end q-mb-md">
              <q-checkbox id="boolField" v-model="s.many.document.boolField" filled label="boolField" />
            </div>
            <q-input
              id="priceField"
              v-model="s.many.document.priceField"
              filled
              label="priceField"
              :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
              type="number"
            />
            <q-input
              id="imgField"
              v-model="s.many.document.imgField"
              clearable
              filled
              label="imgField"
              :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
              type="url"
            />
            <div class="row justify-center">
              <q-btn class="q-mr-md" color="green" label="Save" no-caps type="submit" />
              <q-btn class="q-mr-md" color="red" label="Reset" no-caps type="reset" />
              <q-btn class="q-mr-md" color="blue" label="Close" no-caps @click="Close()" />
            </div>
            <!-- {{ storeN.data }} -->
          </div>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped></style>
