// tester/App.vue

<template>
<div>

  <nav class="navbar navbar-dark bg-primary mb-3">
    <div class="container">
      <span class="navbar-brand">Finddit</span>
    </div>
  </nav>

  <div class="container">
    <h1>{{ title }}</h1>
  </div>
  
  <div class="container">
    <div class="row">
      <div class="col-auto">
        <button class="btn btn-info" @click="test_click" >test</button>
      </div>
    </div>
  </div>

  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import { path_findFile } from '../src/core' ;

@Component({
  components: {
  },
})
export default class App extends Vue {
  @Prop() private msg!: string;
  title:string = 'Reddit Search';
  custName = 'rug company';
  csno = 253223;
  counter : number = 0 ;

  get custTitle() : string {
    return `${this.csno} ${this.custName}`;
  }

  mounted( )
  {
    this.counter += 10 ;
  }

  async doSearch( args : {searchTerm:string, sortBy:string, searchLimit:string} )
  {
    const { searchTerm, sortBy, searchLimit } = args ;
  }

  test_click( )
  {
    alert('test click') ;
  }

}
</script>

<style>
</style>
