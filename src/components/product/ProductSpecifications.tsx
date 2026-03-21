import React from 'react';

interface Spec {
  key: string;
  value: string;
}

interface Props {
  specifications: Spec[];
}

const ProductSpecifications: React.FC<Props> = ({ specifications }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
      <div className="bg-gray-50 rounded-xl overflow-hidden">
        <table className="w-full">
          <tbody>
            {specifications?.map((spec, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-3 text-sm font-medium text-gray-700 border-b border-gray-200 w-1/3">
                  {spec.key}
                </td>
                <td className="px-6 py-3 text-sm text-gray-900 border-b border-gray-200">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductSpecifications;