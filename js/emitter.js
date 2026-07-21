/**
 * ===================================================
 * emitter.js – Client-side Event Emitter
 * ===================================================
 * A lightweight publish/subscribe utility for the
 * Contact page. Decouples form logic from UI updates.
 */

'use strict';

class ClientEmitter {
  constructor() {
    this._events = {};
  }

  /**
   * Subscribe to an event.
   * @param {string}   event
   * @param {Function} listener
   */
  on(event, listener) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(listener);
    return this;
  }

  /**
   * Unsubscribe from an event.
   * @param {string}   event
   * @param {Function} listener
   */
  off(event, listener) {
    if (!this._events[event]) return this;
    this._events[event] = this._events[event].filter(l => l !== listener);
    return this;
  }

  /**
   * Subscribe once – listener auto-removes after first fire.
   * @param {string}   event
   * @param {Function} listener
   */
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
    return this;
  }

  /**
   * Emit an event with optional payload.
   * @param {string} event
   * @param {...*}   args
   */
  emit(event, ...args) {
    if (!this._events[event]) return this;
    this._events[event].forEach(listener => {
      try { listener(...args); } catch (e) { console.error('Emitter error:', e); }
    });
    return this;
  }
}

// Singleton instance for the contact page
const contactEmitter = new ClientEmitter();
