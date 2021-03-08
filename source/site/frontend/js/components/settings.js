export function define_settings(html) {
    class CSettings extends HTMLElement {
        constructor() {
            super();
            var shadow = this.attachShadow({
                mode: 'open'
            });
            shadow.innerHTML = html;


            let self = this;
            function _class(name) {
                return self.shadowRoot.querySelectorAll("." + name);
            }

            let tabPanes = _class("tab-header")[0].getElementsByTagName("div");

            // for switching tabs
            for (let i = 0; i < tabPanes.length; i++) {
                tabPanes[i].addEventListener("click", function () {

                    _class("tab-header")[0].getElementsByClassName("active")[0].classList.remove("active");
                    tabPanes[i].classList.add("active");

                    _class("tab-indicator")[0].style.top = `calc(80px + ${i * 50}px)`;

                    _class("tab-content")[0].getElementsByClassName("active")[0].classList.remove("active");
                    _class("tab-content")[0].getElementsByClassName("tabcontent")[i].classList.add("active");

                });
            }


            // allow_emergency_stop
            this.allow_emergency_stop = this.shadowRoot.getElementById("allow-emergency-stop");
            this.allow_emergency_stop.addEventListener("change", function () {
                window.user_data.settings.allow_emergency_stop = this.checked;
            });




            function validate_durations() {
                if (self.short_break_min.value < self.long_break_min.value &&
                    self.long_break_min.value < self.working_min.value) {
                    return true;
                }
                return false;
            }


            // work-session duration
            this.working_min = this.shadowRoot.getElementById("working-min");
            this.working_min.addEventListener("change", function () {
                if (validate_durations()) {
                    window.user_data.settings.working_sec = this.value * 60;
                } else {
                    document.getElementById('c-modal').display_alert("FAILED: short break < long break < working time");
                }
                document.getElementById("c-settings").refresh();
            });

            // short-break duration
            this.short_break_min = this.shadowRoot.getElementById("short-break-min");
            this.short_break_min.addEventListener("change", function () {
                if (validate_durations()) {
                    window.user_data.settings.short_break_sec = this.value * 60;
                } else {
                    document.getElementById('c-modal').display_alert("FAILED: short break < long break < working time");
                }
                document.getElementById("c-settings").refresh();
            });

            // long-break duration
            this.long_break_min = this.shadowRoot.getElementById("long-break-min");
            this.long_break_min.addEventListener("change", function () {
                if (validate_durations()) {
                    window.user_data.settings.long_break_sec = this.value * 60;
                } else {
                    document.getElementById('c-modal').display_alert("FAILED: short break < long break < working time");
                }
                document.getElementById("c-settings").refresh();
            });



            // bind
            this.refresh.bind(this);
        }

        refresh() {
            this.allow_emergency_stop.checked = window.user_data.settings.allow_emergency_stop;
            this.working_min.value = window.user_data.settings.working_sec / 60;
            this.short_break_min.value = window.user_data.settings.short_break_sec / 60;
            this.long_break_min.value = window.user_data.settings.long_break_sec / 60;
        }

    }
    customElements.define('c-settings', CSettings);
    return CSettings;
}