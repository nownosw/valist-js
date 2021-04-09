import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import AddressIdenticon from '../Identicons/AddressIdenticon';
import ValistContext from '../Valist/ValistContext';

const User = ({ address }: { address: string }) => (
  <li className="py-4" key={address}>
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">
        <AddressIdenticon address={address} height={8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {address}
        </p>
      </div>
    </div>
  </li>
);

const ManageProjectAccessCard = ({ orgName, projectName }: { orgName: string, projectName: string }): JSX.Element => {
  const valist = useContext(ValistContext);
  const [repoAdmins, setRepoAdmins] = useState(['0x0']);
  const [repoDevs, setRepoDevs] = useState(['0x0']);

  const updateData = async () => {
    if (valist) {
      try {
        setRepoAdmins(await valist.getRepoAdmins(orgName, projectName));
        setRepoDevs(await valist.getRepoDevs(orgName, projectName));
      } catch (e) {
        console.error('Could not fetch ACL data', e);
      }
    }
  };

  useEffect(() => {
    updateData();
  }, [valist]);

  return (
    <section aria-labelledby="recent-hires-title">
      <div className="rounded-lg bg-white overflow-hidden shadow">
        <div className="p-6">
          <h2 className="text-base font-medium text-gray-900" id="recent-hires-title">Project Members</h2>
          <div className="flow-root mt-6">
            <ul className="-my-5 divide-y divide-gray-200">
            { repoAdmins[0] !== '0x0' && repoAdmins.map((address) => <User key={address} address={address} />)}
            { repoDevs[0] !== '0x0' && repoDevs.map((address) => <User key={address} address={address} />)}
            </ul>
          </div>
          <div className="mt-6">
            <Link href={`/v/${orgName}/${projectName}/permissions`}>
              <a className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm
              font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                View all
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManageProjectAccessCard;