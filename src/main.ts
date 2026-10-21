import { mount } from 'svelte';
import App from './app/App.svelte';
import './styles/app.css';
import 'katex/dist/katex.min.css';
mount(App, { target: document.getElementById('app')! });
