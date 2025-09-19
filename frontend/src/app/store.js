import { configureStore } from '@reduxjs/toolkit';
import AuthReducer from '../slices/auth.slice.js';
import AuditorReducer from '../slices/auditor.slice.js';
import SalesmanReducer from '../slices/salesman.slice.js';
import CounterReducer from '../slices/counter.silce.js';
import AssignAuditReducer from '../slices/assignAudit.slice.js';
import uiReducer from '../slices/ui.slice.js';

const store = configureStore({
  reducer: {
    auth: AuthReducer,
    auditor: AuditorReducer,
    salesman: SalesmanReducer,
    counter: CounterReducer,
    assignAudit: AssignAuditReducer, 
    ui:uiReducer
  },
});

export default store;
