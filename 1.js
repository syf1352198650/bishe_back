const arr=[
    '华银基金-0.pdf',
    '华银基金-1.pdf',
    '华银基金-10.pdf',
    '华银基金-11.pdf',
    '华银基金-2.pdf',
    '华银基金-3.pdf',
    '华银基金-4.pdf',
    '华银基金-5.pdf',
    '华银基金-6.pdf',
    '华银基金-7.pdf',
    '华银基金-8.pdf',
    '华银基金-9.pdf'
  ]
  arr.sort((a,b)=>{
   return a.substring(a.lastIndexOf('-')+1,a.lastIndexOf('.'))-b.substring(b.lastIndexOf('-')+1,b.lastIndexOf('.'))
  })
// console.log( arr[1].lastIndexOf('-'),arr[1].lastIndexOf('.'));
// console.log(arr[2].substring(arr[2].lastIndexOf('-')+1,arr[2].lastIndexOf('.')));
console.log(arr);