import { api } from '../boot/axios';
import { defineStore } from 'pinia';
import { Notify, Loading } from 'quasar';

// Convert JSON document to TS Interface quickly: https://transform.tools/json-to-typescript

// Interface for Application
export interface IApp {
  showEditDialog: boolean;
  showNewDialog: boolean;
  filter: string;
  selected: Array<any>;
  currentYear: number;
  dummy: any;
  dummys: Array<any>;
}

// Interfaces for OneSide
export interface IOne {
  id: number;
  categoryNameField: string;
}
interface IOneDoc {
  // For handle CRUD operations:
  document: IOne; // use for create, update, delete and store one document
  documentOld: IOne; // use for only edit (diff and restore)
  documents: IOne[]; // use for store API responses
}

// Interfaces for ManySide
export interface IMany {
  id: number; // PK
  categoryId: number; // FK
  titleField: string;
  descField: string;
  dateField: string;
  boolField: boolean;
  priceField: number;
  imgField: string;
  category: {
    id: number;
    categoryNameField: string;
  };
}
interface IManyDoc {
  document: IMany; // use for create, update, delete and store one document
  documentOld: IMany; // use for only edit (diff and restore)
  documents: IMany[]; // use for store API responses
}

// Interfaces for OtherSide
export interface IOther {
  id: number; // PK
}
interface IOtherDoc {
  document: IOther; // use for create, update, delete and store one document
  documentOld: IOther; // use for only edit (diff and restore)
  documents: IOther[]; // use for store API responses
}

export interface IStore {
  app: IApp;
  one: IOneDoc;
  many: IManyDoc;
  other: IOtherDoc;
}

export const useStore = defineStore('Store', {
  state: (): IStore => ({
    app: {
      selected: [],
      filter: '',
      showEditDialog: false,
      showNewDialog: false,
      currentYear: new Date().getFullYear(),
      dummy: null,
      dummys: [],
    },
    one: {
      document: {} as IOne,
      documentOld: {} as IOne,
      documents: [] as IOne[], // empty array for store API responses
    },
    many: {
      document: {} as IMany,
      documentOld: {} as IMany,
      documents: [] as IMany[], // empty array for store API responses
    },
    other: {
      document: {} as IOther,
      documentOld: {} as IOther,
      documents: [] as IOther[], // empty array for store API responses
    },
  }),
  // getters: {},
  actions: {
    async OneGetAll(): Promise<void> {
      try {
        Loading.show();
        this.one.documents = [];
        const res = await api.get('/categories');
        if (res?.data) {
          this.one.documents = res.data;
        }
      } catch (error) {
        ShowErrorWithNotify(error);
      } finally {
        Loading.hide();
      }
    },

    async ManyGetAll(): Promise<void> {
      try {
        Loading.show();
        this.many.documents = [];
        const res = await api.get('/advertisements');
        if (res?.data) {
          this.many.documents = res.data;
        }
      } catch (error) {
        ShowErrorWithNotify(error);
      } finally {
        Loading.hide();
      }
    },

    async ManyGetById(): Promise<void> {
      try {
        Loading.show();
        if (this.many?.document?.id) {
          const res = await api.get(`/advertisements/${this.many.document.id}`);
          if (res?.data) {
            this.many.document = res.data;
            // store startig data to PATCH method and Reset button:
            Object.assign(this.many.documentOld, this.many.document);
          }
        }
      } catch (error) {
        ShowErrorWithNotify(error);
      } finally {
        Loading.hide();
      }
    },

    async ManyFilter(): Promise<void> {
      try {
        if (this.app?.filter) {
          this.many.documents = [];
          Loading.show();
          const res = await api.get(`/advertisements?_expand=category&q=${this.app.filter}`);
          if (res?.data) {
            this.many.documents = res.data;
          }
        }
      } catch (error) {
        ShowErrorWithNotify(error);
      } finally {
        Loading.hide();
      }
    },

    async ManyEditById(): Promise<void> {
      try {
        if (this.many?.document?.id) {
          const diff: IMany = {} as IMany;
          Object.keys(this.many.document).forEach((k, i) => {
            const newValue = Object.values(this.many.document)[i];
            const oldValue = Object.values(this.many.documentOld)[i];
            if (newValue != oldValue) diff[k] = newValue;
          });
          if (Object.keys(diff).length == 0) {
            Notify.create({
              message: 'Nothing changed!',
              color: 'negative',
            });
          } else {
            Loading.show();
            const res = await api.patch(`/advertisements/${this.many.document.id}`, diff);
            if (res?.data?.id) {
              const data: IMany = res.data;
              Notify.create({
                message: `Document with id=${data.id} has been edited successfully!`,
                color: 'positive',
              });
            }
          }
        }
      } catch (error) {
        ShowErrorWithNotify(error);
      } finally {
        Loading.hide();
      }
    },

    async ManyDeleteById(): Promise<void> {
      try {
        if (this.many?.document?.id) {
          Loading.show();
          const res = await api.delete(`/advertisements/${this.many.document.id}`);
          if (res.status == 200) {
            Notify.create({
              message: `Document with id=${this.many.document.id} has been deleted successfully!`,
              color: 'positive',
            });
            // After successful delete, navigate to the .... page:
            // this.router.push('/');
          }
        }
      } catch (error) {
        ShowErrorWithNotify(error);
      } finally {
        Loading.hide();
      }
    },

    async ManyCreate(): Promise<void> {
      try {
        Loading.show();
        const res = await api.post('/advertisements', this.many.document);
        if (res?.data?.id) {
          const data: IMany = res.data;
          Notify.create({
            message: `New document with id=${data.id} has been saved successfully!`,
            color: 'positive',
          });
        }
        // After successful create, navigate to the .... page:
        // this.router.push('/')
      } catch (error) {
        ShowErrorWithNotify(error);
      } finally {
        Loading.hide();
      }
    },
  },
  // all "state" data is stored in browser session store:
  persist: {
    storage: sessionStorage,
  },
});

Notify.setDefaults({
  position: 'top',
  textColor: 'yellow',
  timeout: 3000,
  actions: [{ icon: 'close', color: 'white' }],
});

function ShowErrorWithNotify(error: any): void {
  Loading.hide();
  let msg = 'Hiba!';

  // The JavaScript optional chaining (?.) operator accesses an object's property or calls a function.
  // If the object accessed or function called is undefined or null,
  // it returns undefined instead of throwing an error.
  if (error?.response?.data?.status) {
    msg += ` (${error.response.data.status}):`;
  } else if (error?.response?.status) {
    msg += ` (${error.response.status}):`;
  } else {
    msg += ':';
  }

  if (error?.response?.data?.message) {
    msg += ` ${error.response.data.message}`;
  } else if (error?.response?.message) {
    msg += ` ${error.response.message}`;
  } else if (error?.request && error?.message) {
    msg += ` No response(${error.message})`; // if no response
  } else if (error?.message) {
    msg += ` Message(${error.message})`;
  } else {
    msg += ' Unknow error message';
  }
  Notify.create({ message: msg, color: 'negative' });
}
