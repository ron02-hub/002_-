'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CrossTabulationProps {
  data: Array<{
    row: string;
    columns: Record<string, number | string>;
  }>;
  title?: string;
}

export function CrossTabulation({ data, title = 'クロス集計表' }: CrossTabulationProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">データがありません</p>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(data[0].columns);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10">項目</TableHead>
                {columns.map((col) => (
                  <TableHead key={col} className="text-center">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium sticky left-0 bg-white z-10">
                    {row.row}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col} className="text-center">
                      {row.columns[col]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

