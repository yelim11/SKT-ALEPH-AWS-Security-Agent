// Read-only host health. No raw event logs, IP addresses, adapter names or credentials.
import os from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const round=(n,p=1)=>Number.isFinite(n)?Number(n.toFixed(p)):null;
const count=n=>Number.isSafeInteger(n)&&n>=0&&n<=10000000?n:null;
function sample(){
  const cores=os.cpus();
  if(!cores?.length)return null;
  return cores.reduce((v,c)=>{
    for(const [k,t] of Object.entries(c.times)){v.total+=t;if(k==='idle')v.idle+=t;}
    return v;
  },{total:0,idle:0});
}
async function cpu(signal){
  const a=sample();if(!a)return null;
  await new Promise((resolve,reject)=>{
    if(signal?.aborted){reject(Error('aborted'));return;}
    const onAbort=()=>{clearTimeout(t);reject(Error('aborted'));};
    const t=setTimeout(()=>{signal?.removeEventListener('abort',onAbort);resolve();},250);
    signal?.addEventListener('abort',onAbort,{once:true});
  });
  const b=sample(),all=b?.total-a.total,off=b?.idle-a.idle;
  return all>0?round(Math.max(0,Math.min(100,100*(1-off/all)))):null;
}
const PS_SCRIPT="\n$ErrorActionPreference='Stop'\n[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false)\n$r=[ordered]@{disk=$null;upAdapters=$null;firewall=$null;events=$null}\ntry {\n  $systemDrive=[string]$env:SystemDrive\n  if($systemDrive) {\n    $d=Get-CimInstance -ClassName Win32_LogicalDisk -ErrorAction Stop |\n      Where-Object {$_.DeviceID -eq $systemDrive} | Select-Object -First 1\n    if($null -ne $d -and $null -ne $d.FreeSpace -and $null -ne $d.Size) {\n      $r.disk=@{freeBytes=[double]$d.FreeSpace;totalBytes=[double]$d.Size}\n    }\n  }\n} catch {}\ntry { $r.upAdapters=[int]@(Get-NetAdapter -ErrorAction Stop | Where-Object {$_.Status -eq 'Up'}).Count } catch {}\ntry {\n  $profiles=@(Get-NetFirewallProfile -PolicyStore ActiveStore -ErrorAction Stop |\n    Select-Object Name,Enabled)\n  if($profiles.Count -gt 0) {\n    $r.firewall=@($profiles | ForEach-Object {\n      @{name=[string]$_.Name;enabled=[bool]$_.Enabled}\n    })\n  }\n} catch {}\n$since=(Get-Date).AddHours(-24)\nfunction EventCount([string]$log,[int]$level){\n  try {\n    return [int](Get-WinEvent -FilterHashtable @{\n      LogName=$log;Level=$level;StartTime=$since\n    } -ErrorAction Stop | Measure-Object).Count\n  } catch {\n    if($_.FullyQualifiedErrorId -like '*NoMatchingEventsFound*'){return 0}\n    return $null\n  }\n}\n$r.events=@{\n  System=@{error=(EventCount 'System' 2);warning=(EventCount 'System' 3)}\n  Application=@{error=(EventCount 'Application' 2);warning=(EventCount 'Application' 3)}\n}\n[Console]::WriteLine(($r | ConvertTo-Json -Depth 5 -Compress))\n";
const emptyEvent=()=>({error:null,warning:null});
export async function readLocalPcHealth({signal}={}){
  const data={source:'local-windows',checkedAt:new Date().toISOString(),
    supported:process.platform==='win32',periodHours:24,
    cpu:{usagePercent:null},memory:{usedMiB:null,totalMiB:null,usagePercent:null},
    disk:{freeGiB:null,totalGiB:null},network:{upAdapterCount:null},
    firewall:{profiles:null},events:{System:emptyEvent(),Application:emptyEvent()}};
  if(process.platform!=='win32')return data;
  const total=os.totalmem(),free=os.freemem();
  if(Number.isFinite(total)&&total>0&&free>=0&&free<=total){
    data.memory={usedMiB:round((total-free)/1048576,0),
      totalMiB:round(total/1048576,0),usagePercent:round(100*(total-free)/total)};
  }
  const powershellPath=join(process.env.SystemRoot||'C:\\Windows',
    'System32','WindowsPowerShell','v1.0','powershell.exe');
  const runCpu=cpu(signal).catch(()=>null);
  try{
    const {stdout}=await exec(powershellPath,
      ['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(PS_SCRIPT,'utf16le').toString('base64')],
      {windowsHide:true,timeout:9000,maxBuffer:32768,signal});
    const raw=JSON.parse(stdout.trim());
    if(raw?.disk&&Number.isFinite(raw.disk.freeBytes)&&Number.isFinite(raw.disk.totalBytes)
      &&raw.disk.freeBytes>=0&&raw.disk.totalBytes>0&&raw.disk.freeBytes<=raw.disk.totalBytes){
      data.disk={freeGiB:round(raw.disk.freeBytes/1073741824),
        totalGiB:round(raw.disk.totalBytes/1073741824)};
    }
    data.network.upAdapterCount=count(raw?.upAdapters);
    if(Array.isArray(raw?.firewall)&&raw.firewall.length>0&&raw.firewall.length<=3){
      const profiles=raw.firewall.map(v=>({name:v?.name,enabled:v?.enabled}));
      if(profiles.every(v=>['Domain','Private','Public'].includes(v.name)&&typeof v.enabled==='boolean')
         &&new Set(profiles.map(v=>v.name)).size===profiles.length)data.firewall.profiles=profiles;
    }
    for(const log of ['System','Application'])
      for(const kind of ['error','warning'])
        data.events[log][kind]=count(raw?.events?.[log]?.[kind]);
  }catch{/* PowerShell failure leaves unavailable fields null, never 0/healthy. */}
  data.cpu.usagePercent=await runCpu;
  return data;
}
