import React, { memo, useMemo } from 'react'
import { useResStore } from '@/store/useResStore'
import JsonViewer from './json-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge";

const ResponseTab = memo(() => {
  const { data, headers, cookies, status } = useResStore();
  
  const contentType = useMemo(() => 
    headers?.['content-type'] || headers?.['Content-Type'] || '', 
    [headers]
  );
  
  const isJson = useMemo(() => contentType.includes('application/json'), [contentType]);
  const isHtml = useMemo(() => contentType.includes('text/html'), [contentType]);
  
  const renderBody = () => {
    if (isJson) {
      return <JsonViewer value={data} />;
    } else if (isHtml) {
      // Strip out script tags and potentially harmful content
      const sanitizedHtml = data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<link[^>]*>/gi, '') // Remove link tags that might try to load external resources
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''); // Remove style tags to prevent CSS conflicts
      
      return (
        <iframe 
          srcDoc={sanitizedHtml}
          className="w-full h-[300px] border-0 bg-background"
          sandbox="" // Empty sandbox - most restrictive, no permissions
          title="HTML Preview"
        />
      );
    } else {
      return <pre className="whitespace-pre-wrap font-mono text-sm">{data}</pre>;
    }
  };
  
  return (<>
  <div>
    {
      status!=0 && (<>
        <p className="font-semibold text-sm mb-1">Content-Type: <span className="text-slate-500">{contentType}</span></p>
      </>)
    }
  </div>
    <Tabs defaultValue="body" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger className='cursor-pointer' value="body">Body</TabsTrigger>
        <TabsTrigger className='cursor-pointer' value="headers">Headers
          {
            status!=0 && (
              <Badge
              className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
              variant="outline"
            >
              {headers && Object.keys(headers).length}
            </Badge>
            )
          }
        </TabsTrigger>
        <TabsTrigger className='cursor-pointer' value="cookies">Cookies
          {
            status!=0 && cookies && (
              <Badge
              className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
              variant="outline"
            >
              {Object.keys(cookies).length}
            </Badge>
            )
          }
        </TabsTrigger>
      </TabsList>
      <TabsContent value="body" className="h-[300px] overflow-hidden">
        {renderBody()}
      </TabsContent>
      <TabsContent value="headers" className="h-[300px] overflow-y-auto">
        {headers && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Header</th>
                <th className="text-left p-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(headers).map(([key, value]) => (
                <tr key={key} className="border-b hover:bg-accent/50">
                  <td className="p-2 font-mono text-sm">{key}</td>
                  <td className="p-2 text-sm break-all">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TabsContent>
      <TabsContent value="cookies" className="h-[300px] overflow-y-auto">
        {cookies && Object.keys(cookies).length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Name</th>
                <th className="text-left p-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cookies).map(([name, value]) => (
                <tr key={name} className="border-b hover:bg-accent/50">
                  <td className="p-2 font-mono text-sm">{name}</td>
                  <td className="p-2 text-sm break-all">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No cookies received
          </div>
        )}
      </TabsContent>
    </Tabs>
    </>)
})

ResponseTab.displayName = 'ResponseTab'

export default ResponseTab