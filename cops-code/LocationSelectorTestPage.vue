<template>
    <div>
        <p>父组件</p>
        <b-location-selector ref="locationSelector" v-model="chosenLocations" @fill-locations="handleFillLocation"
            labelKey="name" :levelLimit="2" valueKey="code" childrenKey="childs" style="display: block" />
    </div>


</template>

<script>
    import axios from "axios";

    export default {
        name: "LocationSelectorPage",
        data() {
            return {
                chosenLocations: [],
            }
        },
        methods: {
            handleFillLocation(locations) {
                let self = this;
                let lastLocation = locations.length > 0 ? locations[locations.length - 1] : null;
                console.log('fetch ' + JSON.stringify(locations));
                this.getLocations(lastLocation ? lastLocation.label : '').then(subLocations => {
                    if (self.$refs.locationSelector) {
                        //添加所有省
                        _.each(subLocations, location => {
                            self.$refs.locationSelector.addLocation(lastLocation ? lastLocation.value : null, location);
                        });
                    }
                })
            },
            getLocations(name) {
                return axios.get(`http://172.16.26.14/meta/map/pcas?path=${name}&recursive=${true}`)
                    .then(resp => {
                        return resp.data.body.results || [];
                    });
            },
        }
    }
</script>

<style scoped>
</style>