import { Empty, Pagination, Skeleton, Space } from "antd";
import { useEffect } from "react";
import { useBikesProvider } from "../providers/useBikesProvider";
import { AddBikeButton } from "./AddBikeButton";
import { BikeListItem } from "./BikeListItem";

export const BikesList = () => {
  const {
    bikes,
    totalCount,
    page,
    limit,
    changePage,
    createBike,
    deleteBike,
    isLoading,
    load,
  } = useBikesProvider();

  useEffect(() => {
    load();
  }, [page, limit]);

  return (
    <Space orientation="vertical" style={{ padding: ".25rem .5rem" }}>
      <AddBikeButton createBike={createBike} />
      {isLoading ? (
        <Skeleton />
      ) : bikes.length === 0 ? (
        <Empty description="No bikes in the catalogue" />
      ) : (
        bikes.map((bike) => (
          <BikeListItem key={bike.id} bike={bike} deleteBike={deleteBike} />
        ))
      )}
      {totalCount > 0 && (
        <Pagination
          current={page}
          pageSize={limit}
          total={totalCount}
          pageSizeOptions={[10, 20, 50]}
          showSizeChanger
          showTotal={(total) => `${total} bikes`}
          onChange={changePage}
        />
      )}
    </Space>
  );
};
